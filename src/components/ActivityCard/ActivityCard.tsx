import React, { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import type { Activity } from '../../types';
import { ActivityType, DifficultyGrade, MeetMode, CostMode } from '../../types';
import { getDisplayableGradeStrings } from '../../constants/climbingData';
import { activityTypeStyles, colors, shadows } from '../../utils/designSystem';
import UserAvatar from '../UserAvatar/UserAvatar';
import './ActivityCard.css';

/**
 * Enhanced ActivityCard Component with Vibrant Gradient Design
 * - Beautiful orange-to-grey gradients
 * - Enhanced visual hierarchy and spacing
 * - Improved micro-interactions and hover effects
 * - Better activity type visual indicators
 */

// Enhanced icon mapping with new design system
const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { 
  text: string; 
  emoji: string; 
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  [ActivityType.BOULDERING]: {
    text: '抱石',
    emoji: '🧗',
    color: activityTypeStyles.BOULDERING.color,
    bgColor: activityTypeStyles.BOULDERING.bgColor,
    borderColor: activityTypeStyles.BOULDERING.borderColor,
  },
  [ActivityType.TOP_ROPE_AUTO_BELAY]: {
    text: '顶绳(自动)',
    emoji: '🔗',
    color: activityTypeStyles.TOP_ROPE_AUTO_BELAY.color,
    bgColor: activityTypeStyles.TOP_ROPE_AUTO_BELAY.bgColor,
    borderColor: activityTypeStyles.TOP_ROPE_AUTO_BELAY.borderColor,
  },
  [ActivityType.TOP_ROPE_MANUAL_BELAY]: {
    text: '顶绳(手动)',
    emoji: '👥',
    color: activityTypeStyles.TOP_ROPE_MANUAL_BELAY.color,
    bgColor: activityTypeStyles.TOP_ROPE_MANUAL_BELAY.bgColor,
    borderColor: activityTypeStyles.TOP_ROPE_MANUAL_BELAY.borderColor,
  },
  [ActivityType.LEAD_CLIMBING]: {
    text: '先锋',
    emoji: '🧭',
    color: activityTypeStyles.LEAD_CLIMBING.color,
    bgColor: activityTypeStyles.LEAD_CLIMBING.bgColor,
    borderColor: activityTypeStyles.LEAD_CLIMBING.borderColor,
  },
  [ActivityType.OUTDOOR]: {
    text: '野外',
    emoji: '🏔️',
    color: activityTypeStyles.OUTDOOR.color,
    bgColor: activityTypeStyles.OUTDOOR.bgColor,
    borderColor: activityTypeStyles.OUTDOOR.borderColor,
  },
  [ActivityType.TRAINING]: {
    text: '训练',
    emoji: '💪',
    color: activityTypeStyles.TRAINING.color,
    bgColor: activityTypeStyles.TRAINING.bgColor,
    borderColor: activityTypeStyles.TRAINING.borderColor,
  },
};

const MEET_MODE_TEXT: Record<MeetMode, string> = {
  [MeetMode.MEET_AT_ENTRANCE]: '门口集合',
  [MeetMode.FIRST_COME_FIRST_CLIMB]: '先到先攀',
};

const COST_MODE_CONFIG: Record<CostMode, { text: string; color: string; bgColor: string }> = {
  [CostMode.FREE]: {
    text: '免费',
    color: colors.success.primary,
    bgColor: colors.success.subtle,
  },
  [CostMode.HOST_TREAT]: {
    text: '发起人请客',
    color: colors.warning.primary,
    bgColor: colors.warning.subtle,
  },
  [CostMode.AA]: {
    text: 'AA制',
    color: colors.secondary[600],
    bgColor: colors.secondary[50]
  },
};

/**
 * Enhanced Tag Component with gradient styling
 */
interface TagProps {
  variant?: 'default' | 'primary' | 'secondary' | 'warning' | 'success' | 'activity-type' | 'gradient';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Tag = memo<TagProps>(({ variant = 'default', children, className = '', style }) => {
  const variantClasses = {
    default: 'bg-white/80 text-neutral-700 border-neutral-200/50 backdrop-blur-sm',
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-500 shadow-md',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white border-secondary-500 shadow-md',
    warning: 'bg-gradient-to-r from-warning-400 to-warning-500 text-warning-900 border-warning-400 shadow-md',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-md',
    'activity-type': 'backdrop-blur-sm shadow-sm', // Custom styling via style prop
    gradient: 'bg-gradient-to-r from-white/90 to-white/70 text-neutral-700 border-white/50 backdrop-blur-sm shadow-sm',
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl
        border transition-all duration-300 ease-smooth
        hover:scale-105 hover:shadow-lg
        ${variantClasses[variant]} ${className}
      `}
      style={style}
    >
      {children}
    </span>
  );
});

Tag.displayName = 'Tag';

/**
 * Props for the ActivityCard component
 */
interface ActivityCardProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  className?: string;
  showDistance?: boolean;
}

/**
 * Enhanced ActivityCard Component with Vibrant Gradient Design
 */
const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onClick, 
  className = '',
  showDistance = false 
}) => {
  // Memoized computed values for performance
  const computedValues = useMemo(() => {
    const isActivityFull = (activity.participantCount || 0) >= activity.slotMax;
    const isActivityStarted = dayjs(activity.datetime).isBefore(dayjs());
    const formattedDateTime = dayjs(activity.datetime).format('MM月DD日 HH:mm');
    const participantText = `${activity.participantCount || 0}/${activity.slotMax}人`;
    const distanceText = activity.distance !== undefined && activity.distance !== null 
      ? `${activity.distance.toFixed(1)}km` 
      : null;
    
    return {
      isActivityFull,
      isActivityStarted,
      formattedDateTime,
      participantText,
      distanceText,
    };
  }, [activity.participantCount, activity.slotMax, activity.datetime, activity.distance]);

  // Memoized activity types with enhanced styling
  const activityTypeTags = useMemo(() => {
    return activity.types.map((type) => {
      const config = ACTIVITY_TYPE_CONFIG[type];
      return (
        <Tag 
          key={type} 
          variant="activity-type"
          style={{
            background: `linear-gradient(135deg, ${config.bgColor} 0%, ${config.color}20 100%)`,
            color: config.color,
            borderColor: config.borderColor,
          }}
        >
          <span className="text-sm drop-shadow-sm">{config.emoji}</span>
          <span className="font-semibold">{config.text}</span>
        </Tag>
      );
    });
  }, [activity.types]);

  // Memoized grade tags with gradient styling
  const gradeTags = useMemo(() => {
    if (!activity.grades || activity.grades.length === 0) return null;
    
    return getDisplayableGradeStrings(activity.grades as DifficultyGrade[]).map((gradeLabel) => (
      <Tag key={gradeLabel} variant="primary">
        {gradeLabel}
      </Tag>
    ));
  }, [activity.grades]);

  // Event handlers
  const handleHostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Could emit an event or call a callback here
  };

  const costModeConfig = COST_MODE_CONFIG[activity.costMode];

  // Dynamic gradient based on activity type
  const getCardGradient = () => {
    // Using a consistent gradient for all cards
    return {
      background: `linear-gradient(135deg, ${colors.primary[500]}15 0%, ${colors.neutral[100]} 40%, ${colors.neutral[50]} 100%)`,
      borderImage: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.neutral[300]} 100%) 1`,
    };
  };

  const cardStyles = getCardGradient();

  return (
    <div 
      className={`
        group relative overflow-hidden rounded-2xl p-6 mb-6 cursor-pointer
        border-2 border-transparent
        transition-all duration-500 ease-smooth
        hover:shadow-2xl hover:shadow-primary-500/20
        transform hover:-translate-y-2 hover:scale-[1.02]
        backdrop-blur-sm
        ${className}
      `}
      onClick={() => onClick?.(activity)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(activity);
        }
      }}
      style={{
        background: cardStyles.background,
        boxShadow: `${shadows.card}, inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
      }}
    >
      {/* Decorative gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[500]}08 0%, transparent 50%, ${colors.secondary[500]}05 100%)`,
        }}
      />

      {/* Status indicators with enhanced styling */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {activity.isPrivate && (
          <Tag variant="warning">
            <span className="text-xs">🔒</span>
            <span>私密</span>
          </Tag>
        )}
        {computedValues.isActivityFull && (
          <Tag variant="warning">
            <span className="text-xs">⚡</span>
            <span>已满员</span>
          </Tag>
        )}
      </div>

      {/* Header with enhanced typography */}
      <div className="mb-5 relative z-10">
        <h3 className="text-xl font-bold text-neutral-800 mb-3 pr-24 leading-tight drop-shadow-sm">
          {activity.title}
        </h3>
        
        {/* Activity types and grades with improved spacing */}
        <div className="flex flex-wrap gap-2.5 mb-4">
          {activityTypeTags}
          {gradeTags}
        </div>
      </div>

      {/* Date, time, and location with enhanced icons */}
      <div className="space-y-3 mb-5 relative z-10">
        <div className="flex items-center gap-3 text-neutral-700">
          <span 
            className="text-lg p-2 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm"
            style={{ color: colors.primary[500] }}
          >
            📅
          </span>
          <span className="text-sm font-semibold">{computedValues.formattedDateTime}</span>
        </div>
        
        <div className="flex items-center gap-3 text-neutral-700">
          <span 
            className="text-lg p-2 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm"
            style={{ color: colors.secondary[500] }}
          >
            📍
          </span>
          <span className="text-sm font-medium">{activity.locationText}</span>
          {showDistance && computedValues.distanceText && (
            <span className="text-xs text-neutral-600 bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
              {computedValues.distanceText}
            </span>
          )}
        </div>
      </div>

      {/* Host info with enhanced avatar styling */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div 
          className="flex items-center gap-4 hover:bg-white/50 rounded-xl p-3 -m-3 transition-all duration-300 cursor-pointer backdrop-blur-sm"
          onClick={handleHostClick}
        >
          <div className="relative">
            <UserAvatar 
              avatar={activity.host?.avatar}
              nickname={activity.host?.nickname || '未知用户'}
              size={40}
            />
            <div 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: colors.success.primary }}
            />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-800">
              {activity.host?.nickname || '未知用户'}
            </div>
            <div className="text-xs text-neutral-600 font-medium">发起人</div>
          </div>
        </div>

        {/* Participant count with gradient styling */}
        <div className="text-right">
          <div 
            className={`text-sm font-bold px-3 py-1 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm ${
              computedValues.isActivityFull ? 'text-warning-600' : 'text-primary-600'
            }`}
          >
            {computedValues.participantText}
          </div>
          <div className="text-xs text-neutral-600 mt-1 font-medium">参与人数</div>
        </div>
      </div>

      {/* Bottom info with enhanced styling */}
      <div 
        className="flex items-center justify-between pt-4 border-t relative z-10"
        style={{ borderColor: `${colors.neutral[200]}80` }}
      >
        <div className="flex items-center gap-4">
          {/* Cost mode with gradient */}
          <Tag 
            variant="activity-type"
            style={{
              background: `linear-gradient(135deg, ${costModeConfig.bgColor} 0%, ${costModeConfig.color}15 100%)`,
              color: costModeConfig.color,
              borderColor: costModeConfig.color + '40',
            }}
          >
            <span className="text-xs">💰</span>
            <span className="font-semibold">{costModeConfig.text}</span>
          </Tag>
          
          {/* Meet mode */}
          <span className="text-xs text-neutral-600 font-medium bg-white/50 px-3 py-1 rounded-lg backdrop-blur-sm">
            {MEET_MODE_TEXT[activity.meetMode]}
          </span>
        </div>

        {/* Enhanced hover indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
          <div 
            className="p-2 rounded-xl shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            }}
          >
            <svg 
              className="w-4 h-4 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${colors.primary[500]} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default memo(ActivityCard); 