import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserSelector, useUserActions } from '../store/useOptimizedStore';
import { showError } from '../utils/notifications';
import { ERROR_MESSAGES } from '../utils/constants';

export function useAuth(required = false) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useUserSelector();
  const { setUser, logout: logoutFromStore, setUserLoading } = useUserActions();

  // Check authentication status on mount and when the route changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we don't have a user but have a token, try to fetch the current user
        if (!user && !isLoading) {
          setUserLoading(true);
          // In a real app, this would make an API call to fetch current user
          // For now, we'll just handle the mock scenario
          const token = localStorage.getItem('climberdaz_token');
          if (!token) {
            logoutFromStore();
          }
          setUserLoading(false);
        }
      } catch (_error) {
        // If there's an error fetching the user, clear the auth state
        console.error('Auth check failed:', _error);
        logoutFromStore();
      }
    };

    checkAuth();
  }, [user, isAuthenticated, isLoading, setUser, logoutFromStore, setUserLoading]);

  // Redirect to login if authentication is required but user is not authenticated
  useEffect(() => {
    if (required && !isAuthenticated && !isLoading) {
      // Store the current location to redirect back after login
      const redirectTo = `${location.pathname}${location.search}`;
      navigate('/login', { 
        state: { from: redirectTo },
        replace: true 
      });
    }
  }, [required, isAuthenticated, isLoading, navigate, location]);

  // Login function
  const login = async (_email: string, _password: string) => {
    try {
      setUserLoading(true);
      // In a real app, this would make an API call to login
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the original URL or home page
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
      return true;
    } catch (_error) {
      showError(ERROR_MESSAGES.SERVER_ERROR);
      return false;
    } finally {
      setUserLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutFromStore();
      navigate('/login', { replace: true });
    } catch (_error) {
      console.error('Logout failed:', _error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(user?.role || ''),
  };
}

// Higher-order component for protecting routes that require authentication
export function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>) {
  function WithAuth(props: T) {
    useAuth(true); // This will handle the redirect if not authenticated
    return <WrappedComponent {...props} />;
  }

  // Set a display name for the HOC for better debugging
  WithAuth.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithAuth as React.ComponentType<T>;
}
