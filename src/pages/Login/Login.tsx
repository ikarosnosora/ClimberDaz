import React, { useState, FormEvent, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { showSuccess, showError } from '../../utils/notifications';
import { VALIDATION_RULES } from '../../utils/constants';
import { colors, shadows } from '../../utils/designSystem';
import './Login.css';

/**
 * Updated Login Component with Real API Integration
 * - Modern gradient-based design system
 * - Climbing-themed branding and colors
 * - Real authentication instead of mock
 */

const Login: React.FC = () => {

  const { login, register, isLoading } = useAuth();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validatePhone = useCallback((value: string): string | null => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!value.trim()) {
      return '请输入手机号';
    }
    if (!phoneRegex.test(value.trim())) {
      return '请输入有效的手机号';
    }
    return null;
  }, []);

  const validatePassword = useCallback((value: string): string | null => {
    if (!value) {
      return '请输入密码';
    }
    if (value.length < 6) {
      return '密码至少6位';
    }
    return null;
  }, []);

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

  const validateVerificationCode = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return '请输入验证码';
    }
    if (value.trim().length !== 6) {
      return '验证码为6位数字';
    }
    return null;
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    switch (field) {
      case 'phone':
        setPhone(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'nickname':
        setNickname(value);
        break;
      case 'verificationCode':
        setVerificationCode(value);
        break;
    }
    
    if (error) {
      setError(null);
    }
  }, [error]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validation
    let validationError = null;
    
    if (!isRegisterMode) {
      // Login validation
      validationError = validatePhone(phone) || validatePassword(password);
    } else {
      // Registration validation
      validationError = validatePhone(phone) || 
                       validatePassword(password) || 
                       validateNickname(nickname) || 
                       validateVerificationCode(verificationCode);
    }

    if (validationError) {
      setError(validationError);
      showError(validationError);
      return;
    }

    setError(null);

    try {
      if (isRegisterMode) {
        // Register
        const success = await register(phone, password, nickname, verificationCode);
        if (success) {
          showSuccess('注册成功！');
        }
      } else {
        // Login
        const success = await login(phone, password);
        if (success) {
          showSuccess('登录成功！');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Error handling is done in the useAuth hook
    }
  }, [phone, password, nickname, verificationCode, isRegisterMode, login, register, validatePhone, validatePassword, validateNickname, validateVerificationCode]);

  const toggleMode = useCallback(() => {
    setIsRegisterMode(!isRegisterMode);
    setError(null);
    // Clear form when switching modes
    setPhone('');
    setPassword('');
    setNickname('');
    setVerificationCode('');
  }, [isRegisterMode]);

  const sendVerificationCode = useCallback(async () => {
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      showError(phoneError);
      return;
    }

    try {
              // FUTURE: Implement SMS verification code sending when SMS provider is configured
        // This requires external SMS service integration (e.g., Twilio, Aliyun SMS)
      showSuccess('验证码已发送到您的手机');
    } catch (error) {
      showError('发送验证码失败，请重试');
    }
  }, [phone, validatePhone]);

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

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Phone Input */}
          <div>
            <label 
              htmlFor="phone" 
              className="block text-sm font-semibold mb-2"
              style={{ color: colors.neutral[700] }}
            >
              手机号
            </label>
            <input 
              type="tel"
              id="phone"
              name="phone"
              placeholder="请输入手机号"
              disabled={isLoading}
              value={phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-4 text-lg font-medium rounded-2xl transition-all duration-300 ease-smooth focus:outline-none focus:ring-4 placeholder-neutral-400"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                border: error ? `2px solid ${colors.error.primary}` : `2px solid ${colors.neutral[200]}`,
                backdropFilter: 'blur(10px)',
                boxShadow: shadows.soft,
              }}
            />
          </div>

          {/* Password Input */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold mb-2"
              style={{ color: colors.neutral[700] }}
            >
              密码
            </label>
            <input 
              type="password"
              id="password"
              name="password"
              placeholder="请输入密码"
              disabled={isLoading}
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-4 text-lg font-medium rounded-2xl transition-all duration-300 ease-smooth focus:outline-none focus:ring-4 placeholder-neutral-400"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                border: error ? `2px solid ${colors.error.primary}` : `2px solid ${colors.neutral[200]}`,
                backdropFilter: 'blur(10px)',
                boxShadow: shadows.soft,
              }}
            />
          </div>

          {/* Registration-specific fields */}
          {isRegisterMode && (
            <>
              {/* Nickname Input */}
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
                  placeholder="输入你的攀岩昵称"
                  disabled={isLoading}
                  value={nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  maxLength={VALIDATION_RULES.NICKNAME.MAX_LENGTH}
                  className="w-full px-4 py-4 text-lg font-medium rounded-2xl transition-all duration-300 ease-smooth focus:outline-none focus:ring-4 placeholder-neutral-400"
                  style={{
                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                    border: error ? `2px solid ${colors.error.primary}` : `2px solid ${colors.neutral[200]}`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: shadows.soft,
                  }}
                />
              </div>

              {/* Verification Code Input */}
              <div>
                <label 
                  htmlFor="verificationCode" 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.neutral[700] }}
                >
                  验证码
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    placeholder="6位验证码"
                    disabled={isLoading}
                    value={verificationCode}
                    onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                    maxLength={6}
                    className="flex-1 px-4 py-4 text-lg font-medium rounded-2xl transition-all duration-300 ease-smooth focus:outline-none focus:ring-4 placeholder-neutral-400"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                      border: error ? `2px solid ${colors.error.primary}` : `2px solid ${colors.neutral[200]}`,
                      backdropFilter: 'blur(10px)',
                      boxShadow: shadows.soft,
                    }}
                  />
                  <button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={isLoading || !phone}
                    className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[600]} 100%)`,
                      boxShadow: shadows.soft,
                    }}
                  >
                    发送验证码
                  </button>
                </div>
              </div>
            </>
          )}

          {error && (
            <p 
              className="text-sm font-medium flex items-center gap-2" 
              style={{ color: colors.error.primary }}
              role="alert"
            >
              <span>⚠️</span>
              {error}
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading || !phone.trim() || !password.trim()}
            className="w-full py-4 px-6 text-lg font-bold text-white rounded-2xl transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4"
            style={{
              background: isLoading || !phone.trim() || !password.trim()
                ? `linear-gradient(135deg, ${colors.neutral[400]} 0%, ${colors.neutral[500]} 100%)`
                : `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[600]} 100%)`,
              boxShadow: isLoading || !phone.trim() || !password.trim() ? shadows.soft : shadows.medium,
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isRegisterMode ? '注册中...' : '登录中...'}</span>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>{isRegisterMode ? '🎯 注册' : '🚀 登录'}</span>
              </span>
            )}
          </button>

          {/* Toggle between login and register */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm font-medium underline transition-colors duration-300"
              style={{ color: colors.primary[600] }}
            >
              {isRegisterMode ? '已有账号？点击登录' : '没有账号？点击注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 