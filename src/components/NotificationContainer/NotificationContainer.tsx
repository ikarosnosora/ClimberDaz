import React from 'react';
import { useNotifications } from '../../utils/notifications';
import './NotificationContainer.css';

/**
 * NotificationContainer - Displays toast notifications
 * Replaces the old ToastProvider with better integration
 */

const NotificationContainer: React.FC = () => {
  const { notifications } = useNotifications();

  if (!notifications.length) return null;

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
        };
      case 'info':
      default:
        return {
          background: 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(255, 126, 95, 0.3)',
        };
    }
  };

  return (
    <div 
      className="notification-container fixed top-4 right-4 space-y-2 max-w-sm"
      style={{ zIndex: 1070 }} // Toast层级 - 永远在最上层 (高于所有其他组件)
    >
      {notifications.map((notification, index) => (
        <div
          key={index}
          className="notification-toast p-4 rounded-lg transform transition-all duration-300 ease-in-out backdrop-blur-sm"
          style={getNotificationStyles(notification.type)}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
              {notification.type === 'info' && 'ℹ️'}
            </span>
            <span className="flex-1">{notification.content}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer; 