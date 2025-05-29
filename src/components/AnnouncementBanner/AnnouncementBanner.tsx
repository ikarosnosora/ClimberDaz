import React, { useState, useEffect } from 'react';
// import { NoticeBar } from 'antd-mobile'; // Removed
// import { SoundOutline } from 'antd-mobile-icons'; // Removed
import type { Announcement } from '../../types';
import { colors, shadows } from '../../utils/designSystem';

interface AnnouncementBannerProps {
  announcements: Announcement[];
  onAnnouncementClick?: (announcement: Announcement) => void;
}

// Enhanced Megaphone Icon for announcements
const MegaphoneIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-10.105c.118.38.245.754.38 1.125m-.755-6.715C20.365 9.999 21 11.45 21 13.125s-.635 3.126-1.605 4.375m-.755-6.715L18.25 7.5" />
  </svg>
);

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcements,
  onAnnouncementClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }
    }, 5000); // Change announcement every 5 seconds

    return () => clearInterval(timer);
  }, [announcements.length, isHovered]);

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  // Dynamic gradient based on announcement importance
  const getAnnouncementGradient = (weight?: number) => {
    if (weight && weight >= 2) {
      // High priority - primary gradient
      return `linear-gradient(135deg, ${colors.primary[500]}15 0%, ${colors.warning.primary}10 50%, ${colors.primary[400]}15 100%)`;
    } else {
      // Normal priority - accent gradient  
      return `linear-gradient(135deg, ${colors.secondary[500]}12 0%, ${colors.secondary[500]}8 50%, ${colors.secondary[400]}12 100%)`;
    }
  };

  const getIconColor = (weight?: number): string => {
    return weight && weight >= 2 ? colors.primary[700] : colors.secondary[700];
  };

  const getTextColor = (weight?: number): string => {
    return weight && weight >= 2 ? colors.primary[600] : colors.secondary[600];
  };

  // Styles from AnnouncementBanner.css integrated with Tailwind:
  // .announcement-banner: relative mb-3 (mb-12px -> mb-3)
  // .adm-notice-bar: bg-[#fff4e6] text-[#fa8c16] text-sm flex items-center p-2 rounded-md (approximating ant design styles)
  // .adm-notice-bar-icon: text-base (font-size: 16px)
  // .announcement-indicators: absolute bottom-[-10px] left-1/2 -translate-x-1/2 flex gap-1 p-1
  // .indicator: w-1.5 h-1.5 rounded-full bg-gray-300 transition-all duration-300 ease-in-out
  // .indicator.active: bg-[#fa8c16] w-4 rounded-sm (width: 16px, border-radius: 3px)

  return (
    <div className="relative mb-6">
      <div
        className="relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-500 ease-smooth hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm border-2"
        onClick={() => onAnnouncementClick?.(currentAnnouncement)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`公告: ${currentAnnouncement.title}`}
        style={{
          background: getAnnouncementGradient(currentAnnouncement.weight),
          borderColor: `${getIconColor(currentAnnouncement.weight)}40`,
          boxShadow: `${shadows.card}, inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onAnnouncementClick?.(currentAnnouncement);
          }
        }}
      >
        {/* Decorative background pattern */}
        <div 
          className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${getIconColor(currentAnnouncement.weight)} 0%, transparent 70%)`,
          }}
        />
        
        <div className="relative z-10 flex items-center gap-4">
          {/* Enhanced Icon with gradient background */}
          <div 
            className="flex-shrink-0 p-3 rounded-xl backdrop-blur-sm border"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
              borderColor: `${getIconColor(currentAnnouncement.weight)}30`,
              color: getIconColor(currentAnnouncement.weight),
              boxShadow: shadows.soft,
            }}
          >
            <MegaphoneIcon />
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Priority badge */}
              {currentAnnouncement.weight && currentAnnouncement.weight >= 2 && (
                <span 
                  className="px-2 py-1 text-xs font-bold rounded-lg backdrop-blur-sm border"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                    color: 'white',
                    borderColor: colors.primary[400],
                    boxShadow: shadows.soft,
                  }}
                >
                  🔥 重要
                </span>
              )}
              
              {/* NEW badge for recent announcements */}
              {new Date().getTime() - new Date(currentAnnouncement.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                <span 
                  className="px-2 py-1 text-xs font-bold rounded-lg backdrop-blur-sm border animate-pulse"
                  style={{
                    background: `linear-gradient(135deg, ${colors.success.primary} 0%, ${colors.secondary[500]} 100%)`,
                    color: 'white',
                    borderColor: colors.success.primary + '60',
                    boxShadow: shadows.soft,
                  }}
                >
                  ✨ NEW
                </span>
              )}
            </div>
            
            <h3 
              className="text-sm font-semibold leading-snug truncate"
              style={{ color: getTextColor(currentAnnouncement.weight) }}
            >
              {currentAnnouncement.title}
            </h3>
          </div>

          {/* Arrow indicator */}
          <div 
            className="flex-shrink-0 p-2 rounded-lg transition-all duration-300 opacity-70 hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
              color: getIconColor(currentAnnouncement.weight),
            }}
          >
            <svg 
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        </div>

        {/* Enhanced hover effect */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `linear-gradient(135deg, ${getIconColor(currentAnnouncement.weight)}10 0%, transparent 50%, ${getIconColor(currentAnnouncement.weight)}05 100%)`,
          }}
        />
      </div>

      {/* Enhanced indicators */}
      {announcements.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {announcements.map((announcement, index) => {
            const isActive = index === currentIndex;
            
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-500 ease-smooth hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isActive ? 'w-8 h-3 rounded-xl' : 'w-3 h-3 rounded-full'
                }`}
                style={{
                  background: isActive 
                    ? `linear-gradient(135deg, ${getIconColor(announcement.weight)} 0%, ${getIconColor(announcement.weight)}80 100%)`
                    : colors.neutral[300],
                  boxShadow: isActive ? shadows.soft : 'none',
                }}
                aria-label={`查看公告 ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementBanner; 