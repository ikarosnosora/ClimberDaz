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

  return (
    <div className="notification-container fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className={`notification-toast p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : notification.type === 'error'
              ? 'bg-red-500 text-white'
              : notification.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
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