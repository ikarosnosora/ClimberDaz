import React, { useState, Suspense, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// import { Popup } from 'antd-mobile'; // Removed antd-mobile
import { lazy } from 'react';
// import { BellOutline } from 'antd-mobile-icons'; // Alternative if FontAwesome is not available

const CreateActivity = lazy(() => import('../../pages/CreateActivity/CreateActivity'));

const ModalLoading = () => (
  <div className="flex items-center justify-center h-full p-5 text-center">
    Loading...
  </div>
);

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/notifications')) return 'notifications'; // Updated for notifications
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/my-activities')) return 'my-activities'; // Retained from original
    return 'home'; // Default
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') navigate('/');
    else if (tab === 'notifications') navigate('/notifications'); // Navigate to notifications
    else if (tab === 'my-activities') navigate('/my-activities');
    else if (tab === 'profile') navigate('/profile');
  };

  const openCreateModal = () => {
    setCreateModalVisible(true);
  };

  // Update active tab when location changes (e.g. browser back/forward)
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/activity')) setActiveTab('home');
    else if (path.startsWith('/notifications')) setActiveTab('notifications');
    else if (path.startsWith('/my-activities')) setActiveTab('my-activities');
    else if (path.startsWith('/profile')) setActiveTab('profile');
    // Add other explicit paths if needed, otherwise default to home or no change
  }, [location.pathname]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 h-16 bg-white shadow-t flex justify-around items-center z-20">
        <button
          className={`bottom-nav-item flex flex-col items-center justify-center text-xs pt-1 ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => handleTabChange('home')}
        >
          <i className="fas fa-home text-xl mb-0.5"></i>
          <span>首页</span>
        </button>
        {/* Optional: My Activities Tab - can be uncommented if desired as a main tab */}
        {/* 
        <button
          className={`bottom-nav-item ${activeTab === 'my-activities' ? 'active' : ''}`}
          onClick={() => handleTabChange('my-activities')}
        >
          <i className="fas fa-clipboard-list text-xl"></i>
          <span>我的活动</span>
        </button> 
        */}
        <button
          className={`bottom-nav-item flex flex-col items-center justify-center text-xs pt-1 ${activeTab === 'create' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={openCreateModal}
        >
          <i className="fas fa-plus-circle text-xl mb-0.5"></i>
          <span>创建</span>
        </button>
        <button
          className={`bottom-nav-item flex flex-col items-center justify-center text-xs pt-1 ${activeTab === 'notifications' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => handleTabChange('notifications')}
        >
          <i className="fas fa-bell text-xl mb-0.5"></i>
          <span>通知</span>
        </button>
        <button
          className={`bottom-nav-item flex flex-col items-center justify-center text-xs pt-1 ${activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => handleTabChange('profile')}
        >
          <i className="fas fa-user text-xl mb-0.5"></i>
          <span>我的</span>
        </button>
      </nav>

      {/* Custom Popup for CreateActivity */}
      {createModalVisible && (
        <>
          {/* Mask */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ease-in-out"
            onClick={() => setCreateModalVisible(false)}
            aria-hidden="true"
          ></div>
          
          {/* Drawer Content */}
          <div 
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out"
          >
            <div className="h-full overflow-y-auto">
              <Suspense fallback={<ModalLoading />}>
                <CreateActivity onClose={() => setCreateModalVisible(false)} />
              </Suspense>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainLayout;
