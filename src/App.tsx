import React, { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializePerformanceTests, performanceTestRunner } from './utils/performanceTest';
import { performanceMonitor } from './utils/performance';
import { useUserSelector } from './store/useOptimizedStore';
import NotificationContainer from './components/NotificationContainer/NotificationContainer';
import StatusBar from './components/StatusBar/StatusBar';
import ConnectionManager from './components/ConnectionManager/ConnectionManager';
import { ErrorBoundary } from './components';
import { ToastProvider } from './components/Toast/ToastProvider';

// Layouts
import MainLayout from './components/MainLayout/MainLayout';

// Enhanced Loading component with climbing theme - Memoized
const Loading = React.memo(() => (
  <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent mb-4"></div>
      <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
        🧗‍♀️
      </div>
    </div>
    <p className="text-gray-600 font-medium mt-4">加载中...</p>
  </div>
));
Loading.displayName = 'Loading';

// App Loading component for initial hydration - Memoized
const AppLoading = React.memo(() => (
  <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="relative">
      <div 
        className="animate-pulse rounded-full h-20 w-20 mb-4 mx-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 126, 95, 0.2) 0%, rgba(255, 69, 114, 0.1) 100%)',
        }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center text-3xl">
        🧗‍♀️
      </div>
    </div>
    <p className="text-gray-600 font-medium mt-4">ClimberDaz 启动中...</p>
  </div>
));
AppLoading.displayName = 'AppLoading';

// Optimized lazy loading with better error handling
const createOptimizedLazyComponent = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  fallbackText: string
) => React.lazy(async () => {
  try {
    return await importFunc();
  } catch (error) {
    console.error(`Failed to load component: ${fallbackText}`, error);
    return {
      default: () => (
        <div className="p-4 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{fallbackText}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            重新加载
          </button>
        </div>
      )
    };
  }
});

// Optimized lazy loaded pages
const ActivityList = createOptimizedLazyComponent(
  () => import('./pages/ActivityList/ActivityList'),
  '活动列表加载失败'
);

const Login = createOptimizedLazyComponent(
  () => import('./pages/Login/Login'),
  '登录页面加载失败'
);

const ActivityDetail = createOptimizedLazyComponent(
  () => import('./pages/ActivityDetail/ActivityDetail'),
  '活动详情加载失败'
);

const Profile = createOptimizedLazyComponent(
  () => import('./pages/Profile/Profile'),
  '个人资料加载失败'
);

const CommentBoard = createOptimizedLazyComponent(
  () => import('./pages/CommentBoard/CommentBoard'),
  '评论区加载失败'
);

const ReviewForm = createOptimizedLazyComponent(
  () => import('./pages/ReviewForm/ReviewForm'),
  '评价表单加载失败'
);

const MyActivities = createOptimizedLazyComponent(
  () => import('./pages/MyActivities/MyActivities'),
  '我的活动加载失败'
);

const AdminDashboardPage = createOptimizedLazyComponent(
  () => import('./pages/AdminDashboardPage/AdminDashboardPage'),
  '管理面板加载失败'
);

const CreateActivity = createOptimizedLazyComponent(
  () => import('./pages/CreateActivity/CreateActivity'),
  '创建活动加载失败'
);

const App: React.FC = () => {
  const { isAuthenticated } = useUserSelector();
  const [isHydrated, setIsHydrated] = useState(false);

  // Memoized debug logging to prevent function recreation
  const logDebugInfo = useCallback((message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`[App Debug] ${message}`, data !== undefined ? data : '');
    }
  }, []);

  // Debug logging
  useEffect(() => {
    logDebugInfo('Component mounted');
    logDebugInfo('Authentication state:', { isAuthenticated, isHydrated });
  }, [isAuthenticated, isHydrated, logDebugInfo]);

  // Optimized hydration with cleanup
  useEffect(() => {
    logDebugInfo('Starting hydration...');
    const timer = setTimeout(() => {
      logDebugInfo('Hydration complete');
      setIsHydrated(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [logDebugInfo]);

  // Memoized service worker registration
  const registerServiceWorker = useCallback(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            logDebugInfo('Service Worker registered successfully:', registration);
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content available, notify user
                    logDebugInfo('New content available, reload to update');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('[SW] Service Worker registration failed:', error);
          });
      });
    }
  }, [logDebugInfo]);

  // Register service worker for offline functionality
  useEffect(() => {
    registerServiceWorker();
  }, [registerServiceWorker]);

  // Initialize performance monitoring and testing (Phase 4)
  useEffect(() => {
    if (import.meta.env.DEV) {
      logDebugInfo('Initializing performance monitoring...');
      
      // Initialize performance tests
      initializePerformanceTests();
      
      // Run performance tests after a delay to avoid blocking initial render
      const performanceTimer = setTimeout(() => {
        performanceTestRunner.runAllSuites().then(() => {
          logDebugInfo('Performance tests completed');
        }).catch((error) => {
          console.error('Performance tests failed:', error);
        });
      }, 5000); // Run after 5 seconds
      
      // Log performance report every 30 seconds in development
      const reportInterval = setInterval(() => {
        performanceMonitor.logReport();
      }, 30000);
      
      return () => {
        clearTimeout(performanceTimer);
        clearInterval(reportInterval);
      };
    }
  }, [logDebugInfo]);

  // Memoized route elements to prevent recreation
  const routeElements = useMemo(() => ({
    activityList: (
      <Suspense fallback={<Loading />}>
        <ActivityList />
      </Suspense>
    ),
    activityDetail: (
      <Suspense fallback={<Loading />}>
        <ActivityDetail />
      </Suspense>
    ),
    profile: (
      <Suspense fallback={<Loading />}>
        <Profile />
      </Suspense>
    ),
    myActivities: (
      <Suspense fallback={<Loading />}>
        <MyActivities />
      </Suspense>
    ),
    createActivity: (
      <Suspense fallback={<Loading />}>
        <CreateActivity />
      </Suspense>
    ),
    commentBoard: (
      <Suspense fallback={<Loading />}>
        <CommentBoard />
      </Suspense>
    ),
    reviewForm: (
      <Suspense fallback={<Loading />}>
        <ReviewForm />
      </Suspense>
    ),
    admin: (
      <Suspense fallback={<Loading />}>
        <AdminDashboardPage />
      </Suspense>
    ),
  }), []);

  // Show app loading screen while hydrating
  if (!isHydrated) {
    logDebugInfo('Showing app loading screen');
    return <AppLoading />;
  }

  if (!isAuthenticated) {
    logDebugInfo('User not authenticated, showing login');
    return (
      <ToastProvider>
        <ErrorBoundary>
          <div className="min-h-screen" id="main-content">
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          </div>
          <NotificationContainer />
        </ErrorBoundary>
      </ToastProvider>
    );
  }

  logDebugInfo('User authenticated, showing main app');
  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="min-h-screen" id="main-content">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={routeElements.activityList} />
              <Route path="activities" element={routeElements.activityList} />
              <Route path="activity/:id" element={routeElements.activityDetail} />
              <Route path="profile" element={routeElements.profile} />
              <Route path="my-activities" element={routeElements.myActivities} />
              <Route path="create-activity" element={routeElements.createActivity} />
              <Route path="comment-board/:activityId" element={routeElements.commentBoard} />
              <Route path="review/:activityId" element={routeElements.reviewForm} />
              <Route path="admin" element={routeElements.admin} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <ConnectionManager />
        <StatusBar />
        <NotificationContainer />
      </ErrorBoundary>
    </ToastProvider>
  );
};

export default React.memo(App);
