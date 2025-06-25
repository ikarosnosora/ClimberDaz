import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { default as Button } from '../../components/Button/Button';
import { default as TextArea } from '../../components/TextArea/TextArea';
import { default as UserAvatar } from '../../components/UserAvatar/UserAvatar';
import { toast } from 'react-toastify';


export interface ReviewTarget {
  id: string;
  name: string;
  avatar?: string;
  activityTitle: string;
  activityDate: Date;
}

export type ReviewRating = 'GOOD' | 'BAD' | 'GHOST' | 'SKIP';

interface ReviewFormData {
  rating: ReviewRating;
  comment: string;
}

export const ReviewForm: React.FC = () => {
  const { activityId, targetId } = useParams<{ activityId: string; targetId: string }>();
  const navigate = useNavigate();
  const { user } = useStore();
  
  const [target, setTarget] = useState<ReviewTarget | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 'SKIP',
    comment: ''
  });
  const [isSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // For now, using mock data
    if (activityId && targetId) {
      setTarget({
        id: targetId,
        name: '攀岩伙伴',
        avatar: '/images/default-avatar.jpg',
        activityTitle: '周末欢乐抱石局',
        activityDate: new Date()
      });
    }
  }, [activityId, targetId]);

  const handleRatingChange = (rating: ReviewRating) => {
    setFormData(prev => ({ ...prev, rating }));
    setError(null);
  };

  const handleCommentChange = (comment: string) => {
    setFormData(prev => ({ ...prev, comment }));
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    
    if (!activityId) {
      toast.error('Activity ID is missing');
      return;
    }
    
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId,
          reviewType: formData.rating,
          comment: formData.comment.trim() || undefined,
          rating: formData.rating === 'GOOD' ? 5 : formData.rating === 'BAD' ? 1 : 3
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      
      toast.success('Review submitted successfully!');
      navigate('/my-activities');
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const getRatingConfig = (rating: ReviewRating) => {
    const configs = {
      GOOD: {
        label: '好评',
        icon: '👍',
        description: '这位伙伴表现很棒',
        gradient: 'from-green-400 to-emerald-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700'
      },
      BAD: {
        label: '差评',
        icon: '👎',
        description: '体验不太好',
        gradient: 'from-red-400 to-rose-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700'
      },
      GHOST: {
        label: '鸽子',
        icon: '🕊️',
        description: '临时取消或爽约',
        gradient: 'from-gray-400 to-slate-500',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700'
      },
      SKIP: {
        label: '跳过',
        icon: '⏭️',
        description: '不了解，不评价',
        gradient: 'from-blue-400 to-indigo-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700'
      }
    };
    return configs[rating];
  };

  if (!target) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-2xl font-bold text-gray-900">评价活动伙伴</h1>
        </div>

        {/* Target User Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <UserAvatar avatar={target.avatar} nickname={target.name} size="lg" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{target.name}</h2>
              <p className="text-gray-600">{target.activityTitle}</p>
              <p className="text-sm text-gray-500">
                {target.activityDate.toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">请选择评价类型</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {(['GOOD', 'BAD', 'GHOST', 'SKIP'] as ReviewRating[]).map((rating) => {
              const config = getRatingConfig(rating);
              const isSelected = formData.rating === rating;
              
              return (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `border-transparent bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                      : `border-gray-200 hover:border-gray-300 ${config.bgColor} ${config.textColor}`
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{config.icon}</div>
                    <div className="font-semibold mb-1">{config.label}</div>
                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                      {config.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment Section */}
        {formData.rating !== 'SKIP' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              补充说明 <span className="text-sm font-normal text-gray-500">(可选)</span>
            </h3>
            
            <TextArea
              value={formData.comment}
              onChange={handleCommentChange}
              placeholder={
                formData.rating === 'GOOD' 
                  ? '分享一下这次愉快的攀岩体验...'
                  : formData.rating === 'BAD'
                  ? '说说遇到的问题，帮助改进...'
                  : '详细说明情况...'
              }
              maxLength={500}
              rows={4}
              className="w-full"
            />
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {formData.rating === 'GOOD' && '好评可以鼓励伙伴继续保持'}
                {formData.rating === 'BAD' && '差评需要提供具体原因'}
                {formData.rating === 'GHOST' && '请简要说明具体情况'}
              </span>
              <span className="text-xs text-gray-400">
                {formData.comment.length}/500
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="sticky bottom-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="primary"
            className="w-full h-12 text-lg font-semibold shadow-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                提交中...
              </div>
            ) : (
              '提交评价'
            )}
          </Button>
        </div>

        {/* Information Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3 mt-0.5">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">评价说明</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 评价将在活动结束后 48 小时内有效</li>
                <li>• 评价一旦提交无法修改，请慎重选择</li>
                <li>• 恶意评价将被系统标记，影响信誉度</li>
                <li>• 选择"跳过"不会影响双方信誉</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm; 