import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Custom throttle function for React event handlers
const createThrottledHandler = <T extends unknown[]>(
  handler: (...args: T) => void,
  limit: number
): ((...args: T) => void) => {
  let inThrottle = false;
  
  return (...args: T) => {
    if (!inThrottle) {
      handler(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
  estimatedItemHeight?: number;
  enableDynamicHeight?: boolean;
}

interface ItemPosition {
  index: number;
  top: number;
  height: number;
}

const VirtualList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  style = {},
  onScroll,
  getItemKey,
  estimatedItemHeight,
  enableDynamicHeight = false,
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const itemPositions = useRef<ItemPosition[]>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize item positions
  useEffect(() => {
    if (!enableDynamicHeight) {
      itemPositions.current = items.map((_, index) => ({
        index,
        top: index * itemHeight,
        height: itemHeight,
      }));
    } else {
      // For dynamic height, we start with estimated heights
      const baseHeight = estimatedItemHeight || itemHeight;
      itemPositions.current = items.map((_, index) => ({
        index,
        top: index * baseHeight,
        height: baseHeight,
      }));
    }
  }, [items, itemHeight, estimatedItemHeight, enableDynamicHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!itemPositions.current.length) {
      return { start: 0, end: 0 };
    }

    let start = 0;
    let end = 0;

    // Find start index
    for (let i = 0; i < itemPositions.current.length; i++) {
      const position = itemPositions.current[i];
      if (position.top + position.height > scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
    }

    // Find end index
    for (let i = start; i < itemPositions.current.length; i++) {
      const position = itemPositions.current[i];
      if (position.top > scrollTop + containerHeight) {
        end = Math.min(itemPositions.current.length - 1, i + overscan);
        break;
      }
      end = i;
    }

    return { start, end: Math.min(end + overscan, itemPositions.current.length - 1) };
  }, [scrollTop, containerHeight, overscan, itemPositions.current.length]);

  // Handle scroll with throttling
  const throttledScrollHandler = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      setIsScrolling(true);
      onScroll?.(newScrollTop);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set scrolling to false after scroll ends
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    },
    [onScroll]
  );

  const handleScroll = useCallback(
    createThrottledHandler(throttledScrollHandler, 16), // ~60fps
    [throttledScrollHandler]
  );

  // Update item height for dynamic sizing
  const updateItemHeight = useCallback((index: number, height: number) => {
    if (!enableDynamicHeight) return;

    const position = itemPositions.current[index];
    if (position && position.height !== height) {
      const diff = height - position.height;
      position.height = height;

      // Update positions for subsequent items
      for (let i = index + 1; i < itemPositions.current.length; i++) {
        itemPositions.current[i].top += diff;
      }
    }
  }, [enableDynamicHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (!itemPositions.current.length) return 0;
    const lastPosition = itemPositions.current[itemPositions.current.length - 1];
    return lastPosition.top + lastPosition.height;
  }, [itemPositions.current]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const result: Array<{
      item: T;
      index: number;
      top: number;
      height: number;
      key: string | number;
    }> = [];

    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (i < items.length) {
        const position = itemPositions.current[i];
        result.push({
          item: items[i],
          index: i,
          top: position.top,
          height: position.height,
          key: getItemKey ? getItemKey(items[i], i) : i,
        });
      }
    }

    return result;
  }, [items, visibleRange, getItemKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={scrollElementRef}
      className={`virtual-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        ...style,
      }}
      onScroll={handleScroll}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ item, index, top, height, key }) => (
          <VirtualListItem
            key={key}
            item={item}
            index={index}
            top={top}
            height={height}
            renderItem={renderItem}
            isVisible={!isScrolling}
            onHeightChange={enableDynamicHeight ? updateItemHeight : undefined}
          />
        ))}
      </div>
    </div>
  );
};

// Individual item component with height measurement
interface VirtualListItemProps<T> {
  item: T;
  index: number;
  top: number;
  height: number;
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode;
  isVisible: boolean;
  onHeightChange?: (index: number, height: number) => void;
}

const VirtualListItem = <T,>({
  item,
  index,
  top,
  height,
  renderItem,
  isVisible,
  onHeightChange,
}: VirtualListItemProps<T>) => {
  const itemRef = useRef<HTMLDivElement>(null);

  // Measure item height for dynamic sizing
  useEffect(() => {
    if (onHeightChange && itemRef.current) {
      const observer = new ResizeObserver(([entry]) => {
        const newHeight = entry.contentRect.height;
        if (newHeight !== height) {
          onHeightChange(index, newHeight);
        }
      });

      observer.observe(itemRef.current);

      return () => observer.disconnect();
    }
  }, [onHeightChange, height, index]);

  return (
    <div
      ref={itemRef}
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        height: onHeightChange ? 'auto' : height,
        minHeight: onHeightChange ? height : undefined,
      }}
    >
      {renderItem(item, index, isVisible)}
    </div>
  );
};

// Higher-order component for easy integration with existing components
interface VirtualizedListWrapperProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  maxHeight?: number;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
  enableDynamicHeight?: boolean;
}

export const VirtualizedListWrapper = <T,>({
  items,
  renderItem,
  itemHeight = 80,
  maxHeight = 400,
  className = '',
  getItemKey,
  enableDynamicHeight = false,
}: VirtualizedListWrapperProps<T>) => {
  const containerHeight = Math.min(maxHeight, items.length * itemHeight);

  if (items.length < 10) {
    // For small lists, don't use virtualization
    return (
      <div className={`non-virtual-list ${className}`} style={{ maxHeight }}>
        {items.map((item, index) => (
          <div key={getItemKey ? getItemKey(item, index) : index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <VirtualList
      items={items}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={(item, index) => renderItem(item, index)}
      className={className}
      getItemKey={getItemKey}
      enableDynamicHeight={enableDynamicHeight}
    />
  );
};

export default VirtualList; 