import React, { useState, Suspense, lazy } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { colors, shadows, zIndex } from '../../utils/designSystem';
// import { TabBar, Popup } from 'antd-mobile'; // Removed
// import {
//   AppOutline,
//   AddCircleOutline,
//   UserOutline,
//   UnorderedListOutline,
//   MessageOutline,
// } from 'antd-mobile-icons'; // Removed

const CreateActivity = lazy(() => import('../../pages/CreateActivity/CreateActivity'));

const ModalLoading = () => (
  <div className="p-5 text-center text-neutral-600">
    <div className="animate-pulse">正在加载...</div>
  </div>
);

// Enhanced SVG Icon Components with climbing theme
const HomeIcon = ({ active }: { active?: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill={active ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    strokeWidth={active ? 0 : 1.5} 
    stroke="currentColor" 
    className="w-6 h-6 transition-all duration-200"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const ListIcon = ({ active }: { active?: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill={active ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    strokeWidth={active ? 0 : 1.5} 
    stroke="currentColor" 
    className="w-6 h-6 transition-all duration-200"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const BellIcon = ({ active }: { active?: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill={active ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    strokeWidth={active ? 0 : 1.5} 
    stroke="currentColor" 
    className="w-6 h-6 transition-all duration-200"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const UserIcon = ({ active }: { active?: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill={active ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    strokeWidth={active ? 0 : 1.5} 
    stroke="currentColor" 
    className="w-6 h-6 transition-all duration-200"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const PlusIcon = ({ size = 24 }: { size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    style={{ width: size, height: size }}
    className="transition-all duration-200"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const tabs = [
    { 
      key: '/', 
      title: '首页', 
      icon: (active?: boolean) => <HomeIcon active={active} />,
      label: '发现活动'
    },
    { 
      key: '/my-activities', 
      title: '我的活动', 
      icon: (active?: boolean) => <ListIcon active={active} />,
      label: '我的'
    },
    { 
      key: '/notifications', 
      title: '通知', 
      icon: (active?: boolean) => <BellIcon active={active} />,
      label: '消息'
    },
    { 
      key: '/profile', 
      title: '我的', 
      icon: (active?: boolean) => <UserIcon active={active} />,
      label: '个人'
    },
  ];

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  const showTabBarPaths = ['/', '/my-activities', '/notifications', '/profile'];
  const shouldShowTabBar = showTabBarPaths.includes(location.pathname);
  const isCreateActivityPage = location.pathname === '/create-activity';

  // Migrated styles from Layout.css:
  // .app-layout: flex flex-col min-h-screen w-full bg-gray-100 (bg-f5f5f5)
  // @media (min-width: 768px): md:max-w-lg md:mx-auto md:shadow-lg (max-width: 500px is roughly md:max-w-lg)
  // .app-content: flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]
  // For content padding when tabbar is visible: pb-[calc(64px+env(safe-area-inset-bottom))] (assuming 64px tabbar height)

  // .app-tabbar: fixed bottom-0 left-0 right-0 bg-white shadow-[-1px_0_4px_rgba(0,0,0,0.08)] z-50
  // Safe area: pb-[env(safe-area-inset-bottom)] (applied to inner content of tabbar items or tabbar itself if needed)
  // Tailwind's `pb-safe` can be used if configured. Otherwise, direct `pb-[env(safe-area-inset-bottom)]`.

  return (
    <div 
      className="flex flex-col min-h-screen w-full md:max-w-lg md:mx-auto md:shadow-large"
      style={{ backgroundColor: colors.neutral[50] }}
    >
      {/* Main content area with proper spacing */}
      <div 
        className={`flex-1 overflow-y-auto ${
          shouldShowTabBar 
            ? 'pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-[calc(64px+env(safe-area-inset-bottom))]' 
            : 'pb-[env(safe-area-inset-bottom)]'
        }`}
      >
        <Outlet />
      </div>

      {/* Enhanced Tab Bar */}
      {shouldShowTabBar && !isCreateActivityPage && (
        <div 
          className="fixed bottom-0 left-0 right-0 md:max-w-lg md:mx-auto backdrop-blur-md bg-white/95"
          style={{ 
            boxShadow: shadows.large,
            zIndex: zIndex.fixed,
            borderTop: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <nav className="flex justify-around items-center h-18 px-2 pb-[env(safe-area-inset-bottom)]">
            {tabs.map((item) => {
              const isActive = location.pathname === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  className={`
                    flex flex-col items-center justify-center py-2 px-3 rounded-xl
                    text-xs font-medium transition-all duration-200 ease-smooth
                    min-w-[60px] relative group
                    ${isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div 
                      className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{ backgroundColor: colors.primary[500] }}
                    />
                  )}
                  
                  <div className="mb-1">
                    {item.icon(isActive)}
                  </div>
                  
                  <span className="leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Enhanced Floating Action Button */}
      {shouldShowTabBar && !isCreateActivityPage && (
        <button
          onClick={() => setCreateModalVisible(true)}
          className="
            fixed bottom-24 right-5 md:right-[calc(50%-230px)]
            w-14 h-14 rounded-full
            bg-gradient-to-r from-primary-500 to-primary-600
            text-white shadow-large
            transition-all duration-300 ease-smooth
            hover:from-primary-600 hover:to-primary-700
            hover:shadow-xl hover:scale-105
            active:scale-95
            focus:outline-none focus:ring-4 focus:ring-primary-200
            group
          "
          style={{ zIndex: zIndex.fixed }}
          aria-label="创建新活动"
        >
          <div className="flex items-center justify-center w-full h-full">
            <PlusIcon size={28} />
          </div>
          
          {/* Pulse animation on hover */}
          <div className="absolute inset-0 rounded-full bg-primary-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping" />
        </button>
      )}

      {/* Enhanced Create Activity Modal */}
      {createModalVisible && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          {/* Backdrop blur effect */}
          <div className="absolute inset-0 backdrop-blur-sm" onClick={() => setCreateModalVisible(false)} />
          
          {/* Modal container with slide-in animation */}
          <div 
            className="relative w-full h-full bg-white shadow-xl transform transition-all duration-300 ease-smooth md:max-w-lg md:h-auto md:rounded-2xl md:max-h-[90vh]"
            style={{
              transform: createModalVisible ? 'translateY(0) scale(1)' : 'translateY(100%) scale(0.95)',
            }}
          >
            <div className="h-full overflow-y-auto">
              <Suspense fallback={<ModalLoading />}>
                <CreateActivity />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout; 