import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PullToRefresh.css';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  isRefreshing?: boolean;
  threshold?: number; // Distance to trigger refresh
  maxPullDistance?: number; // Maximum pull distance
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  isRefreshing = false,
  threshold = 80,
  maxPullDistance = 120,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || !containerRef.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0 && containerRef.current.scrollTop === 0) {
      e.preventDefault();
      const distance = Math.min(deltaY * 0.5, maxPullDistance);
      setPullDistance(distance);
    }
  }, [isPulling, startY, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      await onRefresh();
    }

    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, onRefresh, isRefreshing]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Reset pull distance when refreshing starts
  useEffect(() => {
    if (isRefreshing) {
      setPullDistance(0);
    }
  }, [isRefreshing]);

  const getRefreshIconRotation = () => {
    if (isRefreshing) return 'rotate-360';
    return pullDistance >= threshold ? 'rotate-180' : 'rotate-0';
  };

  const getRefreshText = () => {
    if (isRefreshing) return '🧗‍♀️ 正在刷新...';
    if (pullDistance >= threshold) return '🚀 释放刷新';
    return '⬇️ 下拉刷新';
  };

  const getRefreshOpacity = () => {
    return Math.min(pullDistance / threshold, 1);
  };

  return (
    <div 
      ref={containerRef}
      className="pull-to-refresh-container"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="pull-to-refresh-indicator"
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? 80 : 0)}px`,
          opacity: getRefreshOpacity(),
        }}
      >
        <div className="refresh-content">
          <div className={`refresh-icon ${getRefreshIconRotation()}`}>
            {isRefreshing ? (
              <div className="climbing-animation">
                <span className="climber">🧗‍♀️</span>
                <div className="rope"></div>
              </div>
            ) : (
              <span className="arrow">⬇️</span>
            )}
          </div>
          <span className="refresh-text">{getRefreshText()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh; 