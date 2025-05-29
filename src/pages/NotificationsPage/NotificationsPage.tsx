import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { NavBar, Toast } from 'antd-mobile'; // Removed antd-mobile
import { NotificationList, Notification } from '../../components/Notifications'; // Assuming this component does not use antd-mobile directly or will be refactored
import { showInfo } from '../../utils/notifications';

// Mock notifications data for now
const mockUserNotifications: Notification[] = [
  {
    id: '1',
    type: 'activity_join',
    title: '报名成功: 周末欢乐抱石局',
    message: '您已成功报名 周末欢乐抱石局 活动。',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    isRead: false,
    linkTo: '/activity/1',
  },
  {
    id: '2',
    type: 'new_comment',
    title: '新留言: 关于先锋练习',
    message: "Alice 在 '先锋练习' 活动中发表了新留言。",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: true,
    linkTo: '/activity/some-other-id/comments',
  },
  {
    id: '3',
    type: 'system_announcement',
    title: '系统维护通知',
    message: '本周日凌晨2-4点将进行系统维护。',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    isRead: true,
  },
];

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [userNotifications, setUserNotifications] = useState<Notification[]>(mockUserNotifications);
  const [isLoading] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleNotificationClick = (notification: Notification) => {
    setUserNotifications(prev => 
      prev.map(n => n.id === notification.id ? {...n, isRead: true} : n)
    );
    if (notification.linkTo) {
      navigate(notification.linkTo);
    } else {
      showInfo('此通知没有可跳转的链接');
    }
  };

  return (
    <div className="notifications-page flex flex-col h-screen">
      {/* Custom NavBar using Tailwind */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4">
          <div className="relative flex items-center justify-center h-12">
            <button 
              onClick={handleBack} 
              className="absolute left-0 p-2 text-blue-500 hover:text-blue-700"
              aria-label="Go back"
            >
              {/* Replace with an SVG back icon later */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">我的通知</h1>
          </div>
        </div>
      </div>

      {/* Assuming NotificationList will be refactored or does not use antd-mobile */}
      <div className="flex-grow overflow-y-auto">
        <NotificationList 
          notifications={userNotifications} 
          onNotificationClick={handleNotificationClick} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default NotificationsPage; 