import React from 'react';
// import { List } from 'antd-mobile'; // Removed antd-mobile
// import { BellOutline } from 'antd-mobile-icons'; // Removed antd-mobile-icons
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import './NotificationItem.css';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// Modern Icons matching NotificationCenter design
const getIconForType = (type: string) => {
  switch (type) {
    case 'activity_join':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      );
    case 'new_comment':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.627 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      );
    case 'system_announcement':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-10.105c.118.38.245.754.38 1.125m-.755-6.715C20.365 9.999 21 11.45 21 13.125s-.635 3.126-1.605 4.375m-.755-6.715L18.25 7.5" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      );
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'activity_join': return '活动报名';
    case 'new_comment': return '新留言';
    case 'system_announcement': return '系统公告';
    case 'activity_update': return '活动更新';
    case 'new_review': return '新评论';
    default: return '通知';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'activity_join': return '#10B981'; // Green
    case 'new_comment': return '#3B82F6'; // Blue
    case 'system_announcement': return '#F59E0B'; // Amber
    case 'activity_update': return '#8B5CF6'; // Purple
    case 'new_review': return '#EF4444'; // Red
    default: return '#6B7280'; // Gray
  }
};

export interface Notification {
  id: string;
  type: 'activity_join' | 'activity_update' | 'new_comment' | 'new_review' | 'system_announcement' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  linkTo?: string;
  relatedActivityId?: string;
  relatedUserId?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const handleItemClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const isNew = new Date().getTime() - new Date(notification.timestamp).getTime() < 24 * 60 * 60 * 1000; // Within 24 hours

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
      onKeyDown={(e) => e.key === 'Enter' && handleItemClick()}
      className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
    >
      <div className="notification-item-content">
        <div 
          className="notification-icon-wrapper"
          style={{ 
            background: `linear-gradient(135deg, ${getTypeColor(notification.type)}20 0%, ${getTypeColor(notification.type)}10 100%)`,
            color: getTypeColor(notification.type)
          }}
        >
          {getIconForType(notification.type)}
        </div>
        
        <div className="notification-content">
          <div className="notification-header">
            <span className="notification-type-label">{getTypeLabel(notification.type)}</span>
            {isNew && (
              <span className="new-notification-badge">NEW</span>
            )}
            {!notification.isRead && (
              <div className="unread-indicator" />
            )}
          </div>
          
          <div className="notification-title">{notification.title}</div>
          <div className="notification-message">{notification.message}</div>
          <div className="notification-timestamp">
            {dayjs(notification.timestamp).fromNow()}
          </div>
        </div>
      </div>
      
      <div className="notification-chevron">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  );
};

export default NotificationItem;
