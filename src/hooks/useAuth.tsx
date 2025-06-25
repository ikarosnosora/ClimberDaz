import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserSelector, useUserActions } from '../store/useOptimizedStore';
import { showError, showSuccess } from '../utils/notifications';
import { ERROR_MESSAGES } from '../utils/constants';
import { AuthService, LoginRequest, RegisterRequest } from '../services/api/authService';
import { ApiErrorClass } from '../utils/api';

export function useAuth(required = false) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useUserSelector();
  const { setUser, logout: logoutFromStore, setUserLoading } = useUserActions();

  // Check authentication status on mount and when the route changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we don't have a user but have a valid token, try to fetch the current user
        if (!user && !isLoading && AuthService.isAuthenticated()) {
          setUserLoading(true);
          try {
            const currentUser = await AuthService.getProfile();
            setUser(currentUser);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // If fetching profile fails, clear auth state
            await logoutFromStore();
          } finally {
            setUserLoading(false);
          }
        } else if (!user && !AuthService.isAuthenticated()) {
          // No token, ensure auth state is cleared
          await logoutFromStore();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await logoutFromStore();
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

  // Login function with real API
  const login = async (phone: string, password: string) => {
    try {
      setUserLoading(true);
      
      const credentials: LoginRequest = { phone, password };
      const response = await AuthService.login(credentials);
      
      // Set user in store
      setUser(response.user);
      
      showSuccess('登录成功！');
      
      // Redirect to the original URL or home page
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      
      if (error instanceof ApiErrorClass) {
        if (error.status === 401) {
          showError('手机号或密码错误');
        } else {
          showError(error.message || ERROR_MESSAGES.SERVER_ERROR);
        }
      } else {
        showError(ERROR_MESSAGES.SERVER_ERROR);
      }
      
      return false;
    } finally {
      setUserLoading(false);
    }
  };

  // Register function with real API
  const register = async (phone: string, password: string, nickname: string, verificationCode: string) => {
    try {
      setUserLoading(true);
      
      const userData: RegisterRequest = { 
        phone, 
        password, 
        nickname, 
        verificationCode 
      };
      
      const response = await AuthService.register(userData);
      
      // Set user in store
      setUser(response.user);
      
      showSuccess('注册成功！');
      
      // Redirect to home page
      navigate('/', { replace: true });
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error instanceof ApiErrorClass) {
        if (error.status === 409) {
          showError('该手机号已被注册');
        } else if (error.status === 400) {
          showError('验证码错误或已过期');
        } else {
          showError(error.message || ERROR_MESSAGES.SERVER_ERROR);
        }
      } else {
        showError(ERROR_MESSAGES.SERVER_ERROR);
      }
      
      return false;
    } finally {
      setUserLoading(false);
    }
  };

  // Logout function with real API
  const logout = async () => {
    try {
      setUserLoading(true);
      await AuthService.logout();
      await logoutFromStore();
      showSuccess('已退出登录');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, clear local state
      await logoutFromStore();
      navigate('/login', { replace: true });
    } finally {
      setUserLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
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
