import React from 'react';
// import { List } from 'antd-mobile'; // Removed antd-mobile
// import { BellOutline } from 'antd-mobile-icons'; // Removed antd-mobile-icons
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// Icon placeholder
const BellOutline = () => <span className="text-gray-500">[🔔]</span>;

export interface Notification { // This interface might be better in a types.ts file if shared
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

  const getIconForType = () => {
    // Customize icon based on notification.type if needed later
    return <BellOutline />;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      key={notification.id}
      onClick={handleItemClick}
      onKeyDown={(e) => e.key === 'Enter' && handleItemClick()} // for accessibility
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex items-start space-x-3 ${notification.isRead ? 'bg-gray-50' : 'bg-white'}`}
      // The old inline style for read/unread can be replaced by Tailwind bg classes too.
      // style={{ backgroundColor: notification.isRead ? '#f9f9f9' : '#fff' }} // Kept for reference, Tailwind classes preferred.
    >
      <div className="flex-shrink-0 pt-1">
        {getIconForType()}
      </div>
      <div className="flex-grow">
        <div className={`font-medium mb-1 ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
          {notification.title}
        </div>
        <div className={`text-sm mb-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>{notification.message}</div>
        <div className="text-xs text-gray-400">
          {dayjs(notification.timestamp).fromNow()}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
