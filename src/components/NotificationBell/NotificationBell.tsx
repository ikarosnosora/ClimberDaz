import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NotificationBell.css';

interface NotificationBellProps {
  notificationCount?: number;
  hasNewNotifications?: boolean;
  className?: string;
}

/**
 * NotificationBell - Integrated header notification button
 * Modern design with badge and pulse animation
 */
const NotificationBell: React.FC<NotificationBellProps> = ({ 
  notificationCount = 0, 
  hasNewNotifications = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPressed, setIsPressed] = useState(false);

  const isActive = location.pathname === '/notifications';

  const handleClick = () => {
    navigate('/notifications');
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`notification-bell ${hasNewNotifications ? 'has-new-notifications' : ''} ${isPressed ? 'pressed' : ''} ${isActive ? 'active' : ''} ${className}`}
      aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} new)` : ''}`}
    >
      <i className="fas fa-bell notification-bell-icon"></i>
      
      {notificationCount > 0 && (
        <div className="notification-badge">
          <span className="notification-count">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        </div>
      )}
    </button>
  );
};

export default NotificationBell; 