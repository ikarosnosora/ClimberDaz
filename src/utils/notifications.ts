import React from 'react';

/**
 * Unified notification system to replace alert() calls
 * Provides consistent UX across the entire application
 */

interface NotificationConfig {
  content: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

class NotificationManager {
  private static instance: NotificationManager;
  private notifications: NotificationConfig[] = [];
  private listeners: ((notifications: NotificationConfig[]) => void)[] = [];

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  subscribe(listener: (notifications: NotificationConfig[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  show(config: NotificationConfig) {
    const notification = {
      ...config,
      duration: config.duration || 3000,
    };

    this.notifications.push(notification);
    this.notify();

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(notification);
    }, notification.duration);
  }

  private remove(notification: NotificationConfig) {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notify();
    }
  }

  clear() {
    this.notifications = [];
    this.notify();
  }
}

const notificationManager = NotificationManager.getInstance();

// Convenience functions
export const showToast = (config: NotificationConfig) => {
  notificationManager.show(config);
};

export const showSuccess = (content: string, duration?: number) => {
  showToast({ content, type: 'success', duration });
};

export const showError = (content: string, duration?: number) => {
  showToast({ content, type: 'error', duration });
};

export const showWarning = (content: string, duration?: number) => {
  showToast({ content, type: 'warning', duration });
};

export const showInfo = (content: string, duration?: number) => {
  showToast({ content, type: 'info', duration });
};

// Hook for components to listen to notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<NotificationConfig[]>([]);

  React.useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  return { notifications, showToast, showSuccess, showError, showWarning, showInfo };
};

export default notificationManager; 