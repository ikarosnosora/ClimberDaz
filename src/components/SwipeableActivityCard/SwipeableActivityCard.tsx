import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ActivityCard } from '../index';
import { Activity } from '../../types';
import { useUserSelector, useActivityActions } from '../../store/useOptimizedStore';
import { showSuccess, showError } from '../../utils/notifications';
import './SwipeableActivityCard.css';

interface SwipeableActivityCardProps {
  activity: Activity;
  onClick: (activity: Activity) => void;
  onSwipeAction?: (activity: Activity, action: 'join' | 'leave') => Promise<void>;
}

const SwipeableActivityCard: React.FC<SwipeableActivityCardProps> = ({
  activity,
  onClick,
  onSwipeAction,
}) => {
  const { user } = useUserSelector();
  const { joinActivity, leaveActivity } = useActivityActions();
  
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const maxSwipeDistance = 120;
  const swipeThreshold = 80;

  // Check if user can join/leave this activity
  const canJoin = user && !activity.participantIds?.includes(user.openid) && activity.hostId !== user.openid;
  const canLeave = user && activity.participantIds?.includes(user.openid) && activity.hostId !== user.openid;
  const canSwipe = canJoin || canLeave;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canSwipe) return;
    
    setStartX(e.touches[0].clientX);
    setIsSwipeActive(true);
  }, [canSwipe]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwipeActive || !canSwipe) return;
    
    const deltaX = e.touches[0].clientX - startX;
    
    // Determine swipe direction and limit distance
    let newDistance = 0;
    if (canJoin && deltaX > 0) {
      // Swipe right to join
      newDistance = Math.min(deltaX, maxSwipeDistance);
    } else if (canLeave && deltaX < 0) {
      // Swipe left to leave
      newDistance = Math.max(deltaX, -maxSwipeDistance);
    }
    
    setSwipeDistance(newDistance);
  }, [isSwipeActive, startX, canJoin, canLeave, canSwipe]);

  const handleTouchEnd = useCallback(async () => {
    if (!isSwipeActive || !canSwipe) return;
    
    setIsSwipeActive(false);
    
    const shouldTriggerAction = Math.abs(swipeDistance) >= swipeThreshold;
    
    if (shouldTriggerAction && user) {
      setIsAnimating(true);
      
      try {
        if (swipeDistance > 0 && canJoin) {
          // Join action
          if (onSwipeAction) {
            await onSwipeAction(activity, 'join');
          } else {
            await joinActivity(activity.id);
            showSuccess('🎉 成功参加活动！');
          }
        } else if (swipeDistance < 0 && canLeave) {
          // Leave action
          if (onSwipeAction) {
            await onSwipeAction(activity, 'leave');
          } else {
            await leaveActivity(activity.id);
            showSuccess('✅ 已退出活动');
          }
        }
      } catch (error) {
        showError('操作失败，请重试');
      } finally {
        setIsAnimating(false);
      }
    }
    
    // Reset swipe state
    setSwipeDistance(0);
  }, [isSwipeActive, swipeDistance, canJoin, canLeave, user, activity, onSwipeAction, joinActivity, leaveActivity, canSwipe]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getSwipeIcon = () => {
    if (swipeDistance > 0 && canJoin) return '👋';
    if (swipeDistance < 0 && canLeave) return '🚪';
    return '';
  };

  const getSwipeText = () => {
    if (swipeDistance > 0 && canJoin) return '参加活动';
    if (swipeDistance < 0 && canLeave) return '退出活动';
    return '';
  };

  const getSwipeColor = () => {
    if (swipeDistance > 0 && canJoin) return 'join';
    if (swipeDistance < 0 && canLeave) return 'leave';
    return 'neutral';
  };

  const shouldShowSwipeIndicator = Math.abs(swipeDistance) > 20;
  const swipeProgress = Math.abs(swipeDistance) / swipeThreshold;

  return (
    <div className="swipeable-card-container">
      {/* Swipe Action Background */}
      {shouldShowSwipeIndicator && (
        <div 
          className={`swipe-action-bg swipe-action-${getSwipeColor()}`}
          style={{
            transform: `translateX(${swipeDistance}px)`,
            opacity: Math.min(swipeProgress, 1),
          }}
        >
          <div className="swipe-action-content">
            <div className="swipe-icon">{getSwipeIcon()}</div>
            <span className="swipe-text">{getSwipeText()}</span>
            {swipeProgress >= 1 && (
              <div className="swipe-ready-indicator">松手确认</div>
            )}
          </div>
        </div>
      )}

      {/* Activity Card */}
      <div
        ref={cardRef}
        className={`swipeable-card ${isAnimating ? 'swipe-animating' : ''}`}
        style={{
          transform: `translateX(${swipeDistance}px)`,
          transition: isSwipeActive ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ActivityCard
          activity={activity}
          onClick={onClick}
        />
        
        {canSwipe && !isSwipeActive && (
          <div className="swipe-hint">
            {canJoin && canLeave ? (
              <span>← 退出 | 参加 →</span>
            ) : canJoin ? (
              <span>→ 滑动参加</span>
            ) : (
              <span>← 滑动退出</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeableActivityCard; 