import React, { useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserActions } from '../../store/useOptimizedStore';
import { showSuccess, showError } from '../../utils/notifications';
import { VALIDATION_RULES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';
import { mockUsers } from '../../data/mockData';
import { colors, shadows } from '../../utils/designSystem';
import type { User } from '../../types';
import './Login.css';

/**
 * Optimized Login Component with Climbing-Inspired Design
 * - Modern gradient-based design system
 * - Climbing-themed branding and colors
 * - Enhanced visual hierarchy and animations
 */

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUserActions();
  
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
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
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 30%, ${colors.primary[100]} 70%, ${colors.secondary[100]} 100%)`,
      }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-3xl backdrop-blur-lg"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
          boxShadow: `${shadows.large}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
          border: `1px solid rgba(255, 255, 255, 0.3)`,
        }}
      >
        {/* Enhanced App Logo */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 text-4xl"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[600]} 100%)`,
              boxShadow: shadows.medium,
            }}
          >
            🧗‍♀️
          </div>
          <h1 
            className="text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
            }}
          >
            ClimberDaz
          </h1>
          <p 
            className="text-lg font-medium"
            style={{ color: colors.neutral[600] }}
          >
            🏔️ 找到你的攀岩搭子
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6" noValidate>
          <div>
            <label 
              htmlFor="nickname" 
              className="block text-sm font-semibold mb-2"
              style={{ color: colors.neutral[700] }}
            >
              攀岩昵称
            </label>
            <input 
              type="text"
              id="nickname"
              name="nickname"
              placeholder="输入你的攀岩昵称..."
              disabled={loading}
              value={nickname}
              onChange={handleNicknameChange}
              aria-invalid={!!error}
              aria-describedby={error ? "nickname-error" : undefined}
              maxLength={VALIDATION_RULES.NICKNAME.MAX_LENGTH}
              className="w-full px-4 py-4 text-lg font-medium rounded-2xl transition-all duration-300 ease-smooth focus:outline-none focus:ring-4 placeholder-neutral-400"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                border: error 
                  ? `2px solid ${colors.error.primary}` 
                  : `2px solid ${colors.neutral[200]}`,
                backdropFilter: 'blur(10px)',
                boxShadow: shadows.soft,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = error ? colors.error.primary : colors.primary[400];
                e.target.style.boxShadow = error 
                  ? `0 0 0 4px ${colors.error.subtle}` 
                  : `0 0 0 4px ${colors.primary[100]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? colors.error.primary : colors.neutral[200];
                e.target.style.boxShadow = shadows.soft;
              }}
            />
            {error && (
              <p 
                id="nickname-error" 
                className="text-sm font-medium mt-2 flex items-center gap-2" 
                style={{ color: colors.error.primary }}
                role="alert"
              >
                <span>⚠️</span>
                {error}
              </p>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !nickname.trim()}
            className="w-full py-4 px-6 text-lg font-bold text-white rounded-2xl transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4"
            style={{
              background: loading || !nickname.trim()
                ? `linear-gradient(135deg, ${colors.neutral[400]} 0%, ${colors.neutral[500]} 100%)`
                : `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[600]} 100%)`,
              boxShadow: loading || !nickname.trim() ? shadows.soft : shadows.medium,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在攀登中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🚀 开始攀岩之旅
              </span>
            )}
          </button>
        </form>

        <div 
          className="text-center mt-8 p-4 rounded-2xl backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)`,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: colors.neutral[600] }}>
            💡 体验提示
          </p>
          <p className="text-xs" style={{ color: colors.neutral[500] }}>
            真实版本将使用微信授权登录<br />
            现在只需输入昵称即可体验所有功能
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 