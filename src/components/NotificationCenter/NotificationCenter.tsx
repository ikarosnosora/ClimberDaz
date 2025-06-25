import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Announcement } from '../../types';
import { NotificationList, Notification } from '../Notifications';
import { showInfo } from '../../utils/notifications';
import './NotificationCenter.css';

interface NotificationCenterProps {
  announcements: Announcement[];
  notificationCount?: number;
  hasNewNotifications?: boolean;
  onAnnouncementClick?: (announcement: Announcement) => void;
  className?: string;
}

// Unified Icons
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-10.105c.118.38.245.754.38 1.125m-.755-6.715C20.365 9.999 21 11.45 21 13.125s-.635 3.126-1.605 4.375m-.755-6.715L18.25 7.5" />
  </svg>
);



// Mock notifications data - should be replaced with real data from props or context
const mockUserNotifications: Notification[] = [
  {
    id: '1',
    type: 'activity_join',
    title: '🎉 报名成功: 周末欢乐抱石局',
    message: '您已成功报名 周末欢乐抱石局 活动。',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    isRead: false,
    linkTo: '/activity/1',
  },
  {
    id: '2',
    type: 'new_comment',
    title: '💬 新留言: 关于先锋练习',
    message: "Alice 在 '先锋练习' 活动中发表了新留言。",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: true,
    linkTo: '/activity/some-other-id/comments',
  },
  {
    id: '3',
    type: 'system_announcement',
    title: '🔧 系统维护通知',
    message: '本周日凌晨2-4点将进行系统维护。',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isRead: true,
  },
  {
    id: '4',
    type: 'new_review',
    title: '⭐ 新评价',
    message: '您参加的活动收到了新的评价。',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    isRead: true,
  },
  {
    id: '5',
    type: 'activity_update',
    title: '📅 活动更新',
    message: '您报名的活动时间有所调整。',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    isRead: true,
  },
];

/**
 * NotificationCenter - Unified notification and announcement component
 * Combines bell notifications with announcements in a cohesive design
 */
const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  announcements = [],
  notificationCount = 0, 
  onAnnouncementClick,
  className = ''
}) => {
  const navigate = useNavigate();
  const [isAnnouncementsExpanded, setIsAnnouncementsExpanded] = useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = useState(false);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [userNotifications, setUserNotifications] = useState<Notification[]>(mockUserNotifications);
  const [isLoading] = useState(false);
  
  // New state for the elevated animation
  const [expandedContent, setExpandedContent] = useState<'notifications' | 'announcements' | null>(null);

  const hasContent = announcements.length > 0 || userNotifications.length > 0;
  const realNotificationCount = userNotifications.filter(n => !n.isRead).length;

  // Auto-rotation for announcements (without horizontal scrolling)
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAnnouncementIndex(prev => 
        prev >= announcements.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  const handleNotificationClick = useCallback(() => {
    setExpandedContent('notifications');
    setIsNotificationsExpanded(true);
  }, []);

  const handleAnnouncementClick = useCallback((announcement: Announcement) => {
    setExpandedContent('announcements');
    setIsAnnouncementsExpanded(false); // Close the old style list if open
    onAnnouncementClick?.(announcement);
  }, [onAnnouncementClick]);

  const handleNotificationItemClick = useCallback((notification: Notification) => {
    // Mark notification as read
    setUserNotifications(prev => 
      prev.map(n => n.id === notification.id ? {...n, isRead: true} : n)
    );
    
    // Close the dropdown
    setExpandedContent(null);
    setIsNotificationsExpanded(false);
    
    // Navigate to the link if available
    if (notification.linkTo) {
      navigate(notification.linkTo);
    } else {
      showInfo('此通知没有可跳转的链接');
    }
  }, [navigate]);

  const closeExpandedViews = useCallback(() => {
    setExpandedContent(null);
    setIsAnnouncementsExpanded(false);
    setIsNotificationsExpanded(false);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeExpandedViews();
      }
    };

    if (expandedContent || isAnnouncementsExpanded || isNotificationsExpanded) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [expandedContent, isAnnouncementsExpanded, isNotificationsExpanded, closeExpandedViews]);

  if (!hasContent) return null;

  // Show the current announcement based on rotation
  const currentAnnouncement = announcements[currentAnnouncementIndex] || announcements[0];
  const hasMultipleAnnouncements = announcements.length > 1;

  return (
    <>
      <div className={`notification-center ${className} ${expandedContent ? 'elevated' : ''}`}>
        {/* Main Notification Bar */}
        <div className="notification-bar">
          {/* Notification Bell Section */}
          <button
            onClick={handleNotificationClick}
            className={`notification-bell-section ${expandedContent === 'notifications' ? 'active' : ''}`}
          >
            <div className="bell-icon-wrapper">
              <BellIcon />
              {notificationCount > 0 && (
                <div className="notification-badge">
                  <span className="notification-count">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                </div>
              )}
            </div>
            <div className="bell-content">
              <span className="bell-label">通知</span>
              {realNotificationCount > 0 && (
                <span className="bell-description">{realNotificationCount} 条新消息</span>
              )}
            </div>
          </button>

          {/* Divider */}
          {announcements.length > 0 && realNotificationCount > 0 && (
            <div className="notification-divider" />
          )}

          {/* Announcement Section */}
          {announcements.length > 0 && (
            <div className="announcement-section">
              <div 
                className={`announcement-content ${expandedContent === 'announcements' ? 'active' : ''}`}
                onClick={() => handleAnnouncementClick(currentAnnouncement)}
              >
                <div className="announcement-icon-wrapper">
                  <MegaphoneIcon />
                </div>
                <div className="announcement-text">
                  <div className="announcement-header">
                    <span className="announcement-label">公告</span>
                    {currentAnnouncement.weight && currentAnnouncement.weight >= 2 && (
                      <span className="priority-badge">重要</span>
                    )}
                    {new Date().getTime() - new Date(currentAnnouncement.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                      <span className="new-badge">NEW</span>
                    )}
                    {/* Announcement Indicators */}
                    {hasMultipleAnnouncements && (
                      <div className="announcement-indicators">
                        {announcements.map((_, index) => (
                          <div
                            key={index}
                            className={`indicator-dot ${index === currentAnnouncementIndex ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="announcement-title">{currentAnnouncement.title}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Expanded Content Area */}
        {expandedContent && (
          <div className="expanded-content-area">
            {expandedContent === 'announcements' && (
              <div className="expanded-announcements">
                <div className="expanded-header">
                  <div className="expanded-title-section">
                    <div className="expanded-icon-wrapper">
                      <MegaphoneIcon />
                    </div>
                    <div className="expanded-header-text">
                      <h3 className="expanded-title">所有公告</h3>
                      <div className="expanded-meta">
                        <span className="expanded-date">
                          {announcements.length} 条公告
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={closeExpandedViews}
                    className="expanded-close-button"
                    aria-label="关闭公告列表"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="expanded-content">
                  <div className="announcements-list">
                    {announcements.map((announcement, index) => (
                      <div
                        key={announcement.id}
                        className={`announcement-list-item ${index === currentAnnouncementIndex ? 'current' : ''}`}
                        onClick={() => onAnnouncementClick?.(announcement)}
                      >
                        <div className="announcement-list-icon">
                          <MegaphoneIcon />
                        </div>
                        <div className="announcement-list-content">
                          <div className="announcement-list-header">
                            {announcement.weight && announcement.weight >= 2 && (
                              <span className="priority-badge small">重要</span>
                            )}
                            {new Date().getTime() - new Date(announcement.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                              <span className="new-badge small">NEW</span>
                            )}
                            <span className="announcement-list-date">
                              {new Date(announcement.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <h4 className="announcement-list-title">{announcement.title}</h4>
                          <p className="announcement-list-preview">{announcement.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {expandedContent === 'notifications' && (
              <div className="expanded-notifications">
                <div className="expanded-header">
                  <div className="expanded-title-section">
                    <div className="expanded-icon-wrapper">
                      <BellIcon />
                      {realNotificationCount > 0 && (
                        <div className="expanded-notification-badge">
                          <span className="expanded-notification-count">
                            {realNotificationCount > 99 ? '99+' : realNotificationCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="expanded-header-text">
                      <h3 className="expanded-title">我的通知</h3>
                      <span className="expanded-subtitle">
                        {realNotificationCount > 0 ? `${realNotificationCount} 条未读消息` : '所有消息已读'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={closeExpandedViews}
                    className="expanded-close-button"
                    aria-label="关闭通知列表"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="expanded-content">
                  <NotificationList 
                    notifications={userNotifications} 
                    onNotificationClick={handleNotificationItemClick} 
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Background overlay with blur effect */}
      {expandedContent && (
        <div className="elevated-overlay" onClick={closeExpandedViews}>
          <div className="elevated-backdrop" />
        </div>
      )}

      {/* Floating Overlay for Announcements (old style) */}
      {isAnnouncementsExpanded && hasMultipleAnnouncements && !expandedContent && (
        <div className="notification-overlay" onClick={closeExpandedViews}>
          <div className="notification-overlay-backdrop" />
          <div className="floating-announcements" onClick={(e) => e.stopPropagation()}>
            <div className="floating-header">
              <h3 className="floating-title">所有公告</h3>
              <button 
                onClick={closeExpandedViews}
                className="floating-close-button"
                aria-label="关闭公告列表"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="floating-content">
              {announcements.map((announcement, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleAnnouncementClick(announcement);
                    closeExpandedViews();
                  }}
                  className={`floating-announcement-item ${index === currentAnnouncementIndex ? 'active' : ''}`}
                >
                  <div className="floating-announcement-icon">
                    <MegaphoneIcon />
                  </div>
                  <div className="floating-announcement-content">
                    <div className="floating-announcement-header">
                      {announcement.weight && announcement.weight >= 2 && (
                        <span className="priority-badge small">重要</span>
                      )}
                      {new Date().getTime() - new Date(announcement.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                        <span className="new-badge small">NEW</span>
                      )}
                    </div>
                    <span className="floating-announcement-title">{announcement.title}</span>
                    <span className="floating-announcement-date">
                      {new Date(announcement.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sliding Dropdown for Notifications (old style) */}
      {isNotificationsExpanded && !expandedContent && (
        <div className="notification-dropdown-overlay" onClick={closeExpandedViews}>
          <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="dropdown-header">
              <div className="dropdown-title-section">
                <div className="dropdown-icon-wrapper">
                  <BellIcon />
                  {realNotificationCount > 0 && (
                    <div className="dropdown-notification-badge">
                      <span className="dropdown-notification-count">
                        {realNotificationCount > 99 ? '99+' : realNotificationCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="dropdown-header-text">
                  <h3 className="dropdown-title">我的通知</h3>
                  <span className="dropdown-subtitle">
                    {realNotificationCount > 0 ? `${realNotificationCount} 条未读消息` : '所有消息已读'}
                  </span>
                </div>
              </div>
              <button 
                onClick={closeExpandedViews}
                className="dropdown-close-button"
                aria-label="关闭通知列表"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="dropdown-content">
              <NotificationList 
                notifications={userNotifications} 
                onNotificationClick={handleNotificationItemClick} 
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationCenter; 