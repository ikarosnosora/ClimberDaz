import React from 'react';
import { colors, shadows } from '../../utils/designSystem';
import './UserAvatar.css'; // Keep for any additional custom styles if needed

// A simple default placeholder image URL or a base64 encoded tiny transparent pixel
const DEFAULT_AVATAR_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel

/**
 * Props for the UserAvatar component
 */
interface UserAvatarProps {
  /** The avatar image URL. If not provided, initials will be shown */
  avatar?: string;
  /** The user's nickname for fallback initials and alt text */
  nickname?: string;
  /** The size of the avatar in pixels */
  size?: number;
  /** The user's level to display as a badge (optional) */
  level?: number;
  /** Additional CSS classes to apply to the avatar container */
  className?: string;
  /** Whether to show online status indicator */
  isOnline?: boolean;
}

/**
 * Enhanced UserAvatar Component with Vibrant Gradient Design
 * 
 * Displays a user's avatar image with gradient backgrounds and modern styling. Features:
 * - Beautiful gradient fallback backgrounds based on user initials
 * - Gradient level badges with climbing-inspired colors
 * - Optional online status indicator
 * - Enhanced visual hierarchy and depth
 * - Responsive design with proper aspect ratio
 * - Smooth hover animations and interactions
 * 
 * @example
 * ```tsx
 * <UserAvatar 
 *   avatar="https://example.com/avatar.jpg"
 *   nickname="John Doe"
 *   level={5}
 *   size={48}
 *   isOnline={true}
 * />
 * ```
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  nickname,
  size = 40,
  level,
  className = '',
  isOnline = false,
}) => {
  const avatarSrc = avatar || DEFAULT_AVATAR_SRC;
  const showFallback = !avatar && nickname;
  const initials = showFallback ? nickname![0].toUpperCase() : null;

  // Generate gradient based on user initials for consistent colors
  const getInitialsGradient = (initial: string) => {
    const charCode = initial.charCodeAt(0);
    const gradients = [
      `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
      `linear-gradient(135deg, ${colors.secondary[400]} 0%, ${colors.secondary[600]} 100%)`,
      `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[500]} 100%)`,
      `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.primary[500]} 100%)`,
      `linear-gradient(135deg, ${colors.neutral[500]} 0%, ${colors.neutral[600]} 100%)`,
    ];
    return gradients[charCode % gradients.length];
  };

  // Get level badge styling based on climbing level
  const getLevelBadgeStyle = (userLevel: number) => {
    if (userLevel >= 8) {
      // Expert climber - primary gradient
      return {
        background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
        border: `2px solid ${colors.primary[400]}`,
        color: 'white',
      };
    } else if (userLevel >= 5) {
      // Advanced climber - secondary gradient
      return {
        background: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
        border: `2px solid ${colors.secondary[400]}`,
        color: 'white',
      };
    } else if (userLevel >= 3) {
      // Intermediate climber - secondary gradient
      return {
        background: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
        border: `2px solid ${colors.secondary[400]}`,
        color: 'white',
      };
    } else {
      // Beginner climber - neutral gradient
      return {
        background: `linear-gradient(135deg, ${colors.neutral[400]} 0%, ${colors.neutral[500]} 100%)`,
        border: `2px solid ${colors.neutral[300]}`,
        color: 'white',
      };
    }
  };

  const avatarSizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const fontSize = Math.max(12, size * 0.4); // Responsive font size for initials

  return (
    <div 
      className={`relative inline-flex items-center justify-center transition-all duration-300 ease-smooth hover:scale-105 ${className}`}
      style={avatarSizeStyle}
    >
      {/* Main Avatar Container */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden transition-all duration-300 ease-smooth hover:shadow-lg"
        style={{
          boxShadow: shadows.soft,
          border: `3px solid rgba(255, 255, 255, 0.8)`,
        }}
      >
        {showFallback ? (
          <div 
            className="flex items-center justify-center w-full h-full text-white font-bold backdrop-blur-sm"
            style={{
              background: getInitialsGradient(initials!),
              fontSize: `${fontSize}px`,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            {initials}
          </div>
        ) : (
          <img 
            src={avatarSrc} 
            alt={nickname || 'User avatar'}
            className="w-full h-full object-cover transition-all duration-300 ease-smooth hover:scale-110"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && initials) {
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'flex items-center justify-center w-full h-full text-white font-bold backdrop-blur-sm';
                fallbackDiv.style.background = getInitialsGradient(initials);
                fallbackDiv.style.fontSize = `${fontSize}px`;
                fallbackDiv.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                fallbackDiv.textContent = initials;
                parent.appendChild(fallbackDiv);
              }
            }}
          />
        )}

        {/* Gradient overlay for depth */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%)`,
          }}
        />
      </div>

      {/* Online Status Indicator */}
      {isOnline && (
        <div 
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white animate-pulse"
          style={{
            width: `${Math.max(8, size * 0.2)}px`,
            height: `${Math.max(8, size * 0.2)}px`,
            background: `linear-gradient(135deg, ${colors.success.primary} 0%, #22C55E 100%)`,
            boxShadow: shadows.soft,
          }}
        />
      )}

      {/* Enhanced Level Badge */}
      {level !== undefined && (
        <div 
          className="absolute -top-1 -right-1 flex items-center justify-center text-xs font-bold rounded-full transition-all duration-300 ease-smooth hover:scale-110 cursor-default"
          style={{
            minWidth: `${Math.max(20, size * 0.4)}px`,
            height: `${Math.max(20, size * 0.4)}px`,
            fontSize: `${Math.max(10, size * 0.25)}px`,
            ...getLevelBadgeStyle(level),
            boxShadow: shadows.medium,
          }}
          title={`攀岩等级: ${level}`}
        >
          <span className="flex items-center gap-0.5">
            {level >= 5 && (
              <span className="text-yellow-300" style={{ fontSize: `${Math.max(8, size * 0.2)}px` }}>
                ⭐
              </span>
            )}
            {level}
          </span>
        </div>
      )}

      {/* Hover Ring Effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[500]}20 0%, ${colors.secondary[500]}20 100%)`,
          transform: 'scale(1.1)',
        }}
      />
    </div>
  );
};

export default UserAvatar; 