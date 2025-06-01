import React, { useEffect, useRef, useCallback } from 'react';
import './InfiniteScroll.css';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  loadMore: () => void;
  loading: boolean;
  threshold?: number; // Distance from bottom to trigger load
  endMessage?: React.ReactNode;
  loader?: React.ReactNode;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  loadMore,
  loading,
  threshold = 200,
  endMessage,
  loader,
}) => {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const checkScrollPosition = useCallback(() => {
    if (!scrollElementRef.current || loadingRef.current || !hasMore || loading) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollElementRef.current;
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight <= threshold;

    if (scrolledToBottom) {
      loadingRef.current = true;
      loadMore();
    }
  }, [hasMore, loading, loadMore, threshold]);

  useEffect(() => {
    if (!loading) {
      loadingRef.current = false;
    }
  }, [loading]);

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      checkScrollPosition();
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial position
    checkScrollPosition();

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [checkScrollPosition]);

  const defaultLoader = (
    <div className="infinite-scroll-loader">
      <div className="loading-content">
        <div className="climbing-dots">
          <div className="dot dot-1">🧗‍♀️</div>
          <div className="dot dot-2">🧗‍♂️</div>
          <div className="dot dot-3">🧗‍♀️</div>
        </div>
        <span className="loading-text">加载更多活动中...</span>
      </div>
    </div>
  );

  const defaultEndMessage = (
    <div className="infinite-scroll-end">
      <div className="end-content">
        <div className="summit-icon">🏔️</div>
        <span className="end-text">已到达顶峰！没有更多活动了</span>
      </div>
    </div>
  );

  return (
    <div ref={scrollElementRef} className="infinite-scroll-container">
      <div className="infinite-scroll-content">
        {children}
      </div>
      
      {loading && (loader || defaultLoader)}
      
      {!hasMore && !loading && (endMessage || defaultEndMessage)}
    </div>
  );
};

export default InfiniteScroll; 