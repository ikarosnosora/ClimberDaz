import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NotificationCenter } from '../index';
import { useAppSelector } from '../../store/useOptimizedStore';
import { showInfo } from '../../utils/notifications';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { announcements } = useAppSelector();

  // Determine active tab based on location
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/activity')) return 'activities';
    if (path.startsWith('/profile') || path.startsWith('/my-activities')) return 'my';
    if (path.startsWith('/create-activity')) return 'create';
    return 'activities';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: string) => {
    if (tab === 'activities') navigate('/');
    else if (tab === 'my') navigate('/profile');
    else if (tab === 'create') navigate('/create-activity');
  };

  const handleAnnouncementClick = React.useCallback((announcement: { id: string; title: string; content: string }) => {
    showInfo(`查看公告: ${announcement.title}`);
  }, []);

  // Mock notification count - replace with real data from store
  const [notificationCount] = React.useState(3);
  const [hasNewNotifications] = React.useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Section with Unified Notification Center */}
      <div className="bg-white shadow-sm border-b border-gray-100 p-4">
        <NotificationCenter
          announcements={announcements}
          notificationCount={notificationCount}
          hasNewNotifications={hasNewNotifications}
          onAnnouncementClick={handleAnnouncementClick}
          className="w-full"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-16 px-4">
          {/* Activities Tab */}
          <button
            className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
              activeTab === 'activities' 
                ? 'text-orange-500 bg-orange-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('activities')}
          >
            <i className={`fas fa-mountain text-xl ${activeTab === 'activities' ? 'text-orange-500' : 'text-gray-500'}`}></i>
            <span className="text-xs mt-1 font-medium">Activities</span>
            {activeTab === 'activities' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"></div>
            )}
          </button>

          {/* Create Activity Button - Center */}
          <button
            className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white transform scale-110'
                : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:scale-105'
            }`}
            onClick={() => handleTabChange('create')}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <i className="fas fa-plus text-xl"></i>
            </div>
            <span className="text-xs mt-1 font-medium">Create</span>
            {activeTab === 'create' && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
            )}
          </button>

          {/* My Profile Tab */}
          <button
            className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
              activeTab === 'my' 
                ? 'text-orange-500 bg-orange-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('my')}
          >
            <i className={`fas fa-user text-xl ${activeTab === 'my' ? 'text-orange-500' : 'text-gray-500'}`}></i>
            <span className="text-xs mt-1 font-medium">My</span>
            {activeTab === 'my' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"></div>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
