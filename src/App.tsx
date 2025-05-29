import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserSelector } from './store/useOptimizedStore';
import NotificationContainer from './components/NotificationContainer/NotificationContainer';
import { ErrorBoundary } from './components';
import { ToastProvider } from './components/Toast/ToastProvider';

// Layouts
import MainLayout from './components/MainLayout/MainLayout';

// Pages
const ActivityList = React.lazy(() => import('./pages/ActivityList/ActivityList'));
const Login = React.lazy(() => import('./pages/Login/Login'));
const ActivityDetail = React.lazy(() => import('./pages/ActivityDetail/ActivityDetail'));
// const CreateActivity = React.lazy(() => import('./pages/CreateActivity/CreateActivity')); // Removed as it is used in MainLayout popup
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const CommentBoard = React.lazy(() => import('./pages/CommentBoard/CommentBoard'));
const ReviewForm = React.lazy(() => import('./pages/ReviewForm/ReviewForm'));
const MyActivities = React.lazy(() => import('./pages/MyActivities/MyActivities'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage/NotificationsPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage/AdminDashboardPage'));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUserSelector();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <NotificationContainer />
        <Suspense fallback={<Loading />}>
          <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Admin Route - typically would have its own protection mechanism */}
              <Route path="/admin" element={<AdminDashboardPage />} />

              {/* Protected User Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ActivityList />} />
                <Route path="activity/:id" element={<ActivityDetail />} />
                <Route path="activity/:id/comments" element={<CommentBoard />} />
                <Route path="activity/:activityId/review/:userId" element={<ReviewForm />} />
                <Route path="profile" element={<Profile />} />
                <Route path="my-activities" element={<MyActivities />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
