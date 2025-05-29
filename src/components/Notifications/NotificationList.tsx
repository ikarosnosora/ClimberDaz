import React from 'react';
// import { List, Empty } from 'antd-mobile'; // Removed antd-mobile
import NotificationItem, { Notification } from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  isLoading?: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
  isLoading
}) => {
  if (isLoading) {
    // Basic loading state, can be replaced with Skeleton later
    return (
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-2 px-4 py-2">通知列表</div>
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 border-b border-gray-200 text-gray-400">
            加载中...
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-16 text-gray-500">
        {/* Replace with an SVG or image icon for Empty state later */}
        <div className="text-4xl mb-4">📭</div> 
        <p>暂无通知</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* The header "通知列表" could be part of the page layout instead of here, or styled if kept */}
      {/* <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">通知列表</div> */}
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onClick={onNotificationClick} 
        />
      ))}
      {/* Optional: Clear All Button - Implement with a Tailwind styled button if needed */}
    </div>
  );
};

export default NotificationList; 