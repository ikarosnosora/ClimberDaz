import React from 'react';
// import { List, Switch, Toast } from 'antd-mobile'; // Removed
import { useUserSelector, useUserActions } from '../../store/useOptimizedStore';
import { showSuccess } from '../../utils/notifications';
import { defaultNotificationPreferences, UserNotificationPreferences } from '../../types';

// Custom Tailwind Switch Component
interface TailwindSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelId?: string; 
}

const TailwindSwitch: React.FC<TailwindSwitchProps> = ({ checked, onChange, labelId }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId} // Optional: for accessibility, link to a label
      onClick={handleToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
};

const NotificationPreferences: React.FC = () => {
  const { user } = useUserSelector();
  const { updateUserNotificationPreferences } = useUserActions();

  const currentPreferences = user?.notificationPreferences || defaultNotificationPreferences;

  const handlePreferenceChange = (
    key: keyof UserNotificationPreferences,
    value: boolean // Changed from checked to value for clarity
  ) => {
    if (!user) return; // Guard against user being null
    updateUserNotificationPreferences({ [key]: value });
    showSuccess('偏好已更新');
  };

  if (!user) {
    return <div className="p-4 text-sm text-gray-500">无法加载通知偏好设置。</div>;
  }

  // Define preference items for easier mapping
  const preferenceItems: Array<{
    id: keyof UserNotificationPreferences;
    label: string;
  }> = [
    {
      id: 'receiveActivityJoinNotifications',
      label: '有人报名我的活动',
    },
    {
      id: 'receiveNewCommentNotifications',
      label: '我的活动有新留言',
    },
    {
      id: 'receiveActivityUpdateNotifications',
      label: '我参与的活动有更新',
    },
    {
      id: 'receiveSystemAnnouncements',
      label: '系统公告和重要通知',
    },
  ];

  return (
    // Removed outer div with marginTop, styling should be handled by parent if needed or within this component's main div
    <div className="notification-preferences-section">
      {/* Removed List header, title is handled by parent Profile.tsx */}
      <div className="space-y-3">
        {preferenceItems.map((item, index) => (
          <div 
            key={item.id} 
            className={`flex items-center justify-between p-3 bg-white rounded-md shadow-sm ${index > 0 ? 'mt-2' : ''}`}
          >
            <label htmlFor={`switch-${item.id}`} className="text-sm text-gray-700 flex-grow mr-4 cursor-pointer" onClick={() => handlePreferenceChange(item.id, !currentPreferences[item.id])}>
              {item.label}
            </label>
            <TailwindSwitch
              checked={currentPreferences[item.id]}
              onChange={(checked) => handlePreferenceChange(item.id, checked)}
              labelId={`switch-label-${item.id}`} // For accessibility
            />
            {/* Hidden label for accessibility, referenced by aria-labelledby in TailwindSwitch */}
            <span id={`switch-label-${item.id}`} className="sr-only">{item.label}</span> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPreferences; 