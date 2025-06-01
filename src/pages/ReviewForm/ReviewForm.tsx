import React, { useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import {
//   NavBar,
//   Form,
//   Button,
//   TextArea,
//   Card,
//   Toast,
//   Dialog,
//   Space,
// } from 'antd-mobile'; // Removed
import { useUserSelector } from '../../store/useOptimizedStore';
import { showSuccess, showError, showWarning } from '../../utils/notifications';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, VALIDATION_RULES } from '../../utils/constants';
import { UserAvatar } from '../../components'; // Assuming this is a refactored component
import { colors, shadows } from '../../utils/designSystem';
import { ReviewStatus } from '../../types';

// Mock data for the user being reviewed (remains for now)
const mockRevieweeData = {
  openid: 'user2',
  nickname: 'Alice',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
};

// Enhanced Back Arrow Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// Enhanced PageHeader component
interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}
const EnhancedPageHeader: React.FC<PageHeaderProps> = ({ title, onBack }) => (
  <div 
    className="sticky top-0 z-10 mb-6 backdrop-blur-lg"
    style={{
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
      border: `1px solid rgba(255, 255, 255, 0.3)`,
      boxShadow: shadows.medium,
    }}
  >
    <div className="px-6 py-4">
      <div className="relative flex items-center justify-center">
        {onBack && (
          <button 
            onClick={onBack} 
            className="absolute left-0 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
              color: colors.primary[600],
            }}
          >
            <BackIcon />
          </button>
        )}
        <h1 
          className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
          }}
        >
          ⭐ {title}
        </h1>
      </div>
    </div>
  </div>
);

// Enhanced TextArea component
interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helpText?: string;
  showCount?: boolean;
  error?: string;
}
const EnhancedFormTextArea: React.FC<FormTextAreaProps> = ({ label, name, helpText, showCount, maxLength, value, error, ...props }) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-semibold mb-2" style={{ color: colors.neutral[700] }}>
      {label}
    </label>
    {helpText && (
      <p className="text-xs mb-2" style={{ color: colors.neutral[500] }}>
        {helpText}
      </p>
    )}
    <textarea
      id={name}
      name={name}
      value={value}
      maxLength={maxLength}
      {...props}
      className="block w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ease-smooth focus:outline-none focus:ring-4 backdrop-blur-sm"
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
    <div className="flex justify-between items-center">
        {error && (
          <p className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: colors.error.primary }}>
            <span>⚠️</span>
            {error}
          </p>
        )}
        {showCount && maxLength && (
        <p className={`mt-2 text-xs font-medium ml-auto ${error ? '' : ''}`} style={{ color: error ? colors.error.primary : colors.neutral[500] }}>
            {String(value)?.length || 0} / {maxLength}
        </p>
        )}
    </div>
  </div>
);

const ReviewForm: React.FC = () => {
  const { activityId } = useParams<{ activityId: string; userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserSelector();
  
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ comment?: string; status?: string }>({});

  const handleBack = () => navigate(-1);

  const validateForm = () => {
    const newErrors: { comment?: string; status?: string } = {};
    if (!selectedStatus) {
      newErrors.status = '请选择一个评价状态';
    }
    if (comment.length > VALIDATION_RULES.COMMENT.MAX_LENGTH) {
      newErrors.comment = `评价内容不能超过${VALIDATION_RULES.COMMENT.MAX_LENGTH}字`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        if (!selectedStatus) {
          showWarning('请选择一个评价状态');
        }
        return;
    }

    if (!currentUser) {
      showError(ERROR_MESSAGES.UNAUTHORIZED);
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      showSuccess(SUCCESS_MESSAGES.REVIEW_SUBMITTED);
      navigate(`/activity/${activityId}`);
    } catch (error) {
      showError(ERROR_MESSAGES.SERVER_ERROR);
      console.error('Review submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (window.confirm('确定要跳过评价吗？跳过后将无法再次评价。')) {
      navigate(-1); // Navigate back
    }
  };

  const reviewStatusOptions = [
    { label: '👍 表现很好', value: ReviewStatus.GOOD, type: 'success' as const },
    { label: '👎 有待改进', value: ReviewStatus.BAD, type: 'error' as const },
    { label: '😕 未到场', value: ReviewStatus.NO_SHOW, type: 'warning' as const },
  ];

  const getOptionStyle = (type: 'success' | 'error' | 'warning', isActive: boolean) => {
    if (isActive) {
      switch (type) {
        case 'success':
          return {
            background: `linear-gradient(135deg, ${colors.success.primary} 0%, ${colors.success.secondary} 100%)`,
            color: 'white',
            border: `2px solid ${colors.success.primary}`,
          };
        case 'error':
          return {
            background: `linear-gradient(135deg, ${colors.error.primary} 0%, ${colors.error.secondary} 100%)`,
            color: 'white',
            border: `2px solid ${colors.error.primary}`,
          };
        case 'warning':
          return {
            background: `linear-gradient(135deg, ${colors.warning.primary} 0%, ${colors.warning.secondary} 100%)`,
            color: 'white',
            border: `2px solid ${colors.warning.primary}`,
          };
      }
    } else {
      switch (type) {
        case 'success':
          return {
            background: `linear-gradient(135deg, ${colors.success.subtle} 0%, rgba(255, 255, 255, 0.8) 100%)`,
            color: colors.success.primary,
            border: `2px solid ${colors.success.soft}`,
          };
        case 'error':
          return {
            background: `linear-gradient(135deg, ${colors.error.subtle} 0%, rgba(255, 255, 255, 0.8) 100%)`,
            color: colors.error.primary,
            border: `2px solid ${colors.error.soft}`,
          };
        case 'warning':
          return {
            background: `linear-gradient(135deg, ${colors.warning.subtle} 0%, rgba(255, 255, 255, 0.8) 100%)`,
            color: colors.warning.primary,
            border: `2px solid ${colors.warning.soft}`,
          };
      }
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
      }}
    >
      <EnhancedPageHeader title="互评参与者" onBack={handleBack} />

      <div className="px-6 space-y-6">
        {/* Enhanced Reviewee Info Card */}
        <div 
          className="p-6 rounded-2xl backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.card,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <div className="flex items-center gap-4">
            <UserAvatar
              avatar={mockRevieweeData.avatar}
              nickname={mockRevieweeData.nickname}
              size={64}
            />
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ color: colors.neutral[800] }}>
                {mockRevieweeData.nickname}
              </h3>
              <p className="text-sm font-medium" style={{ color: colors.neutral[600] }}>
                🎯 对本次活动的参与情况做出评价
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Rating Selection Card */}
        <div 
          className="p-6 rounded-2xl backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.card,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <h3 className="text-lg font-bold text-center mb-4" style={{ color: colors.neutral[700] }}>
            ⭐ 选择评价状态
          </h3>
          {errors.status && (
            <p className="text-sm font-medium text-center mb-4 flex items-center justify-center gap-2" style={{ color: colors.error.primary }}>
              <span>⚠️</span>
              {errors.status}
            </p>
          )}
          <div className="space-y-3">
            {reviewStatusOptions.map(opt => {
              const isActive = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { 
                    setSelectedStatus(opt.value); 
                    setErrors(prev => ({...prev, status: undefined})); 
                  }}
                  className="w-full py-4 px-6 text-sm font-bold rounded-2xl transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 backdrop-blur-sm"
                  style={getOptionStyle(opt.type, isActive)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Comment Card */}
        <div 
          className="p-6 rounded-2xl backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.card,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <form onSubmit={handleSubmit}>
            <EnhancedFormTextArea
              label="💬 补充说明 (选填)"
              name="comment"
              placeholder="分享更多细节，你的评价对其他岩友很有帮助..."
              rows={4}
              maxLength={80}
              showCount
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              helpText="例如：守时情况、技术水平、团队合作、安全意识等方面的表现。"
              error={errors.comment}
            />
          </form>
        </div>
        
        {/* Enhanced Action Buttons */}
        <div className="space-y-4 pb-8">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !selectedStatus}
            className="w-full py-4 px-6 text-lg font-bold text-white rounded-2xl transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: loading || !selectedStatus
                ? `linear-gradient(135deg, ${colors.neutral[400]} 0%, ${colors.neutral[500]} 100%)`
                : `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[600]} 100%)`,
              boxShadow: loading || !selectedStatus ? shadows.soft : shadows.medium,
            }}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? '⏳ 提交中...' : '🚀 提交评价'}
          </button>
          
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-4 px-6 text-lg font-bold rounded-2xl transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
              color: colors.neutral[600],
              border: `2px solid ${colors.neutral[300]}`,
            }}
          >
            ⏭️ 以后再说 (跳过)
          </button>
        </div>

        {/* Enhanced Review Tips */}
        <div 
          className="p-6 rounded-2xl text-center backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)`,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: colors.neutral[600] }}>
            💡 温馨提示
          </p>
          <p className="text-xs mb-1" style={{ color: colors.neutral[500] }}>
            评价提交后不可修改
          </p>
          <p className="text-xs" style={{ color: colors.neutral[500] }}>
            您的评价将帮助我们维护友好的攀岩社区环境 🏔️
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm; 