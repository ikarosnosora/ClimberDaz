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
import { ReviewStatus } from '../../types';

// Mock data for the user being reviewed (remains for now)
const mockRevieweeData = {
  openid: 'user2',
  nickname: 'Alice',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
};

// Simple Back Arrow Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// Simple PageHeader component
interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}
const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack }) => (
  <div className="bg-white shadow-sm flex items-center p-4 sticky top-0 z-10">
    {onBack && (
      <button onClick={onBack} className="mr-2 text-gray-600 hover:text-gray-800">
        <BackIcon />
      </button>
    )}
    <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
  </div>
);

// Basic TextArea component
interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helpText?: string;
  showCount?: boolean;
  error?: string;
}
const CustomFormTextArea: React.FC<FormTextAreaProps> = ({ label, name, helpText, showCount, maxLength, value, error, ...props }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {helpText && <p className="text-xs text-gray-500 mb-1">{helpText}</p>}
    <textarea
      id={name}
      name={name}
      value={value}
      maxLength={maxLength}
      {...props}
      className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50`}
    />
    <div className="flex justify-between items-center">
        {error && <p className="mt-1 text-xs text-red-500 flex-grow">{error}</p>}
        {showCount && maxLength && (
        <p className={`mt-1 text-xs ${error ? 'text-red-500' : 'text-gray-500'} ml-auto`}>
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
    { label: '👍 表现很好 (Good)', value: ReviewStatus.GOOD, color: 'green' },
    { label: '👎 有待改进 (Bad)', value: ReviewStatus.BAD, color: 'red' },
    { label: '😕 未到场 (No-Show)', value: ReviewStatus.NO_SHOW, color: 'yellow' },
  ];

  // Migrating styles from ReviewForm.css to Tailwind
  // .review-form-page: min-h-screen bg-gray-100 (.bg-f5f5f5)
  // .review-content: p-3 (padding: 12px)
  // .reviewee-card: mb-3 + custom styling for inner content
  // .reviewee-info: flex items-center gap-4 py-2
  // .reviewee-details h3: text-lg font-semibold text-gray-800 mb-1
  // .reviewee-details p: text-sm text-gray-600
  // .rating-selection-card: mb-5 p-5 bg-white rounded-lg shadow
  // Space: flex flex-col space-y-3
  // Comment card: mb-5 p-5 bg-white rounded-lg shadow
  // Action buttons: mt-5
  // Review tips: mt-5 p-4 bg-white rounded-lg shadow text-center text-xs text-gray-600

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader title="互评参与者" onBack={handleBack} />

      <div className="p-3">
        {/* Reviewee Info Card */}
        <div className="mb-5 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-4">
            <UserAvatar
              avatar={mockRevieweeData.avatar}
              nickname={mockRevieweeData.nickname}
              size={50}
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-0.5">{mockRevieweeData.nickname}</h3>
              <p className="text-sm text-gray-600">对本次活动的参与情况做出评价</p>
            </div>
          </div>
        </div>

        {/* Rating Selection Card */}
        <div className="mb-5 p-5 bg-white rounded-lg shadow">
          <p className="text-base font-medium text-center mb-4 text-gray-700">选择评价:</p>
          {errors.status && <p className="text-xs text-red-500 text-center mb-2">{errors.status}</p>}
          <div className="flex flex-col space-y-3">
            {reviewStatusOptions.map(opt => {
              const isActive = selectedStatus === opt.value;
              let bgColor = isActive ? `bg-${opt.color}-500` : 'bg-white';
              let textColor = isActive ? 'text-white' : `text-${opt.color}-600`;
              let borderColor = `border-${opt.color}-500`;
              if (opt.color === 'yellow') { // Tailwind yellow needs adjustment for contrast
                 bgColor = isActive ? 'bg-yellow-400' : 'bg-white';
                 textColor = isActive ? 'text-yellow-800' : 'text-yellow-600';
                 borderColor = 'border-yellow-500';
              }
              if (opt.color === 'green') { // Tailwind green
                 bgColor = isActive ? 'bg-green-500' : 'bg-white';
                 textColor = isActive ? 'text-white' : 'text-green-600';
                 borderColor = 'border-green-500';
              }
               if (opt.color === 'red') { // Tailwind red
                 bgColor = isActive ? 'bg-red-500' : 'bg-white';
                 textColor = isActive ? 'text-white' : 'text-red-600';
                 borderColor = 'border-red-500';
              }

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSelectedStatus(opt.value); setErrors(prev => ({...prev, status: undefined})); }}
                  className={`w-full py-3 px-4 border rounded-md text-sm font-medium shadow-sm transition-colors duration-150 ease-in-out ${borderColor} ${bgColor} ${textColor} hover:opacity-90 disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment Card */}
        <form onSubmit={handleSubmit} className="mb-5 p-5 bg-white rounded-lg shadow">
          <CustomFormTextArea
            label="补充说明 (选填)"
            name="comment"
            placeholder="你的评价内容对其他岩友很有帮助 (最多80字)"
            rows={3}
            maxLength={80}
            showCount
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            helpText="分享更多细节，例如守时、技术、氛围、安全等方面的情况。"
            error={errors.comment}
          />
        </form>
        
        {/* Action Buttons */}
        <div className="mt-5 space-y-3">
          <button
            type="submit" // Will trigger form onSubmit from outside if form has an id and this button has form="id"
                        // or handle submit directly
            onClick={handleSubmit} // Direct submit for simplicity here
            disabled={loading || !selectedStatus}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-md shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out flex items-center justify-center"
          >
            {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {loading ? '提交中...' : '提交评价'}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="w-full py-3 px-4 border border-gray-300 hover:bg-gray-100 text-gray-700 text-base font-semibold rounded-md shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
          >
            以后再说 (跳过)
          </button>
        </div>

        {/* Review Tips */}
        <div className="mt-5 p-4 bg-white rounded-lg shadow text-center text-xs text-gray-600">
          <p>💡 评价提交后不可修改。</p>
          <p>🔒 您的评价将帮助我们维护友好的社区环境。</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm; 