import React, { useState, useEffect, FormEvent } from 'react';
// import { Modal, Form, Input, Button, Stepper, TextArea, Toast } from 'antd-mobile'; // Removed
import { useUserSelector, useUserActions } from '../../store/useOptimizedStore';
import { showSuccess, showError } from '../../utils/notifications';
import { VALIDATION_RULES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';
import { ActivityType, GearType } from '../../types';
import type { User } from '../../types';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ProfileFormValues {
  nickname: string;
  city?: string;
  climbingAge?: number;
  introduction?: string;
  climbingPreferences?: ActivityType[];
  frequentlyVisitedGyms?: string; // Stays as string for input, converted on submit
  gearTags?: GearType[];
}

// Basic Input component (can be moved to a shared components folder later if needed)
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, name, type = "text", error, ...props }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      {...props}
      className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// Basic TextArea component
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; showCount?: boolean }> = ({ label, name, error, showCount, maxLength, value, ...props }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={name}
      name={name}
      {...props}
      value={value}
      maxLength={maxLength}
      className={`block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    {showCount && maxLength && (
      <p className="mt-1 text-xs text-gray-500 text-right">
        {String(value)?.length || 0} / {maxLength}
      </p>
    )}
  </div>
);


const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const { user } = useUserSelector();
  const { updateUserProfile } = useUserActions();
  const [formData, setFormData] = useState<ProfileFormValues>({
    nickname: '',
    city: '',
    climbingAge: 0,
    introduction: '',
    climbingPreferences: [],
    frequentlyVisitedGyms: '',
    gearTags: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});

  const climbingPreferenceOptions: Array<{ label: string; value: ActivityType }> = [
    { label: '抱石', value: ActivityType.BOULDERING },
    { label: '运动攀岩', value: ActivityType.LEAD_CLIMBING },
    { label: '传统攀岩', value: ActivityType.TOP_ROPE_MANUAL_BELAY },
    { label: '室内', value: ActivityType.TOP_ROPE_AUTO_BELAY },
    { label: '室外', value: ActivityType.OUTDOOR },
  ];

  const gearTagOptions: Array<{ label: string; value: GearType }> = [
    { label: '快挂', value: GearType.QUICKDRAWS },
    { label: '绳索', value: GearType.ROPE },
    { label: '安全带', value: GearType.HARNESS },
    { label: '下降器', value: GearType.BELAY_DEVICE },
    { label: '攀岩鞋', value: GearType.SHOES },
    { label: '头盔', value: GearType.HELMET },
  ];

  useEffect(() => {
    if (user && visible) {
      setFormData({
        nickname: user.nickname || '',
        city: user.city || '',
        climbingAge: user.climbingAge !== undefined ? user.climbingAge : 0,
        introduction: user.introduction || '',
        climbingPreferences: user.climbingPreferences || [],
        frequentlyVisitedGyms: Array.isArray(user.frequentlyVisitedGyms) ? user.frequentlyVisitedGyms.join(', ') : (user.frequentlyVisitedGyms || ''),
        gearTags: user.gearTags || [],
      });
      setErrors({}); // Clear errors when modal opens with new data
    }
  }, [user, visible]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProfileFormValues]) {
      setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const handleStepperChange = (name: keyof ProfileFormValues, val: string | number) => {
    const numValue = Number(val);
    setFormData((prev) => ({ ...prev, [name]: Math.max(0, numValue) }));
     if (errors[name]) {
      setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
    const trimmedNickname = formData.nickname?.trim();
    
    if (!trimmedNickname) {
      newErrors.nickname = '昵称不能为空';
    } else if (trimmedNickname.length < VALIDATION_RULES.NICKNAME.MIN_LENGTH) {
      newErrors.nickname = `昵称至少${VALIDATION_RULES.NICKNAME.MIN_LENGTH}个字符`;
    } else if (trimmedNickname.length > VALIDATION_RULES.NICKNAME.MAX_LENGTH) {
      newErrors.nickname = `昵称最多${VALIDATION_RULES.NICKNAME.MAX_LENGTH}个字符`;
    }
    
    // Add other validations as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    const processedValues: Partial<User> = {
      ...formData,
      climbingAge: Number(formData.climbingAge),
      frequentlyVisitedGyms: formData.frequentlyVisitedGyms
        ? formData.frequentlyVisitedGyms.split(',').map((item: string) => item.trim()).filter((item: string) => item)
        : [],
    };

    try {
      updateUserProfile(processedValues);
      showSuccess(SUCCESS_MESSAGES.PROFILE_UPDATED);
      onClose();
    } catch (error) {
      showError(ERROR_MESSAGES.SERVER_ERROR);
      console.error('Failed to update profile:', error);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">编辑个人信息</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <FormInput
            label="昵称"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="请输入昵称"
            error={errors.nickname}
            required
          />
          <FormInput
            label="城市"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="请输入城市"
          />
          {/* Replace Stepper with Input type number */}
          <FormInput
            label="岩龄 (年)"
            name="climbingAge"
            type="number"
            value={formData.climbingAge === undefined ? '' : String(formData.climbingAge)}
            onChange={(e) => handleStepperChange('climbingAge', e.target.value)}
            min="0"
          />
          <FormTextArea
            label="简介"
            name="introduction"
            value={formData.introduction}
            onChange={handleInputChange}
            placeholder="介绍一下自己吧"
            rows={3}
            maxLength={100}
            showCount
          />
          
          {/* Climbing Preferences */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">攀爬偏好</label>
            <div className="space-y-2">
              {climbingPreferenceOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.climbingPreferences?.includes(option.value) || false}
                    onChange={(e) => {
                      const newPreferences = e.target.checked
                        ? [...(formData.climbingPreferences || []), option.value]
                        : (formData.climbingPreferences || []).filter(p => p !== option.value);
                      setFormData(prev => ({ ...prev, climbingPreferences: newPreferences }));
                    }}
                    className="h-4 w-4 rounded transition-colors"
                    style={{
                      accentColor: '#FF7E5F',
                      borderColor: '#D1D5DB',
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <FormInput
            label="常去的岩馆 (用逗号分隔)"
            name="frequentlyVisitedGyms"
            value={formData.frequentlyVisitedGyms}
            onChange={handleInputChange}
            placeholder="例如：岩馆A, 岩馆B"
          />

          {/* Gear Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">我的装备</label>
            <div className="space-y-2">
              {gearTagOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.gearTags?.includes(option.value) || false}
                    onChange={(e) => {
                      const newGearTags = e.target.checked
                        ? [...(formData.gearTags || []), option.value]
                        : (formData.gearTags || []).filter(g => g !== option.value);
                      setFormData(prev => ({ ...prev, gearTags: newGearTags }));
                    }}
                    className="h-4 w-4 rounded transition-colors"
                    style={{
                      accentColor: '#FF7E5F',
                      borderColor: '#D1D5DB',
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-all duration-200 disabled:opacity-50 hover:scale-105"
            style={{
              background: isLoading 
                ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                : 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%)',
              boxShadow: '0 2px 8px rgba(255, 126, 95, 0.3)',
              outline: 'none',
              focusRing: '2px solid rgba(255, 126, 95, 0.5)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF8E7B 0%, #FF5A88 100%)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 126, 95, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF7E5F 0%, #FF4572 100%)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 126, 95, 0.3)';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid rgba(255, 126, 95, 0.5)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            {isLoading ? '保存中...' : '保存更改'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 