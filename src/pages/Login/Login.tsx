import React, { useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserActions } from '../../store/useOptimizedStore';
import { showSuccess, showError } from '../../utils/notifications';
import { VALIDATION_RULES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';
import { mockUsers } from '../../data/mockData';
import type { User } from '../../types';
import './Login.css';

/**
 * Optimized Login Component
 * - Uses new notification system instead of alert()
 * - Leverages centralized constants for validation
 * - Uses optimized store selectors
 * - Better error handling and type safety
 * - Improved accessibility
 */

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUserActions();
  
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Memoized validation function
  const validateNickname = useCallback((value: string): string | null => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return '请输入昵称';
    }
    
    if (trimmed.length < VALIDATION_RULES.NICKNAME.MIN_LENGTH) {
      return `昵称至少${VALIDATION_RULES.NICKNAME.MIN_LENGTH}个字符`;
    }
    
    if (trimmed.length > VALIDATION_RULES.NICKNAME.MAX_LENGTH) {
      return `昵称最多${VALIDATION_RULES.NICKNAME.MAX_LENGTH}个字符`;
    }
    
    return null;
  }, []);

  const handleNicknameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  const handleLogin = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateNickname(nickname);
    if (validationError) {
      setError(validationError);
      showError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Create mock user (in real app, this would come from API)
      const mockUser: User = {
        openid: `mock_${Date.now()}`,
        nickname: nickname.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname.trim().replace(/\s/g, '_')}`,
        level: Math.floor(Math.random() * 5) + 1,
        gearTags: [],
        createdAt: new Date(),
        role: 'user',
        isBanned: false,
        notificationPreferences: mockUsers[0].notificationPreferences,
      };

      setUser(mockUser);
      showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      
      // Navigate after a short delay to allow toast to show
      setTimeout(() => navigate('/', { replace: true }), 500);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [nickname, validateNickname, setUser, navigate]);

  return (
    <div className="login-page flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="login-container bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="app-logo text-center mb-8">
          <div className="logo-icon text-6xl mb-2" role="img" aria-label="攀岩图标">
            🧗
          </div>
          <h1 className="app-name text-3xl font-bold text-gray-800">ClimberDaz</h1>
          <p className="app-tagline text-gray-600">找到你的攀岩搭子</p>
        </div>

        <form onSubmit={handleLogin} className="login-form space-y-6" noValidate>
          <div>
            <label 
              htmlFor="nickname" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              昵称
            </label>
            <input 
              type="text"
              id="nickname"
              name="nickname"
              placeholder="请输入你的昵称"
              disabled={loading}
              value={nickname}
              onChange={handleNicknameChange}
              aria-invalid={!!error}
              aria-describedby={error ? "nickname-error" : undefined}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors ${
                error 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              maxLength={VALIDATION_RULES.NICKNAME.MAX_LENGTH}
            />
            {error && (
              <p 
                id="nickname-error" 
                className="text-red-500 text-xs mt-1" 
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !nickname.trim()}
            className="login-button w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                登录中...
              </span>
            ) : (
              '立即开始'
            )}
          </button>
        </form>

        <div className="login-tips text-center mt-8 text-sm text-gray-500">
          <p>💡 真实版本将使用微信授权登录</p>
          <p>现在只需输入昵称即可体验</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 