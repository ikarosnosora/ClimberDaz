import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSelector, useUserActions, useActivitySelector } from '../../store/useOptimizedStore';
import { showSuccess, showError } from '../../utils/notifications';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import { colors, shadows } from '../../utils/designSystem';
import { UserAvatar } from '../../components';
import NotificationPreferences from '../../components/Profile/NotificationPreferences';
import EditProfileModal from '../../components/Profile/EditProfileModal';
import './Profile.css';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserSelector();
  const { logout } = useUserActions();
  const { activities } = useActivitySelector();
  const [editModalVisible, setEditModalVisible] = useState(false);

  // User activities statistics
  const userActivities = activities.filter(activity => activity.hostId === user?.openid);
  const participatedActivities = activities.filter(activity => 
    activity.participantIds?.includes(user?.openid || '')
  );

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      try {
        await logout();
        navigate('/login');
        showSuccess(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
      } catch (error) {
        showError('退出登录失败，请重试');
      }
    }
  };

  if (!user) {
    return (
      <div 
        className="flex items-center justify-center h-screen"
        style={{
          background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
        }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-neutral-500">加载用户信息中...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-20"
      style={{
        background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
      }}
    >
      <div className="p-6 space-y-6">
        {/* Enhanced Profile Header */}
        <div 
          className="rounded-2xl p-8 backdrop-blur-sm border border-white/50"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.large,
          }}
        >
          <div className="text-center">
            <div className="flex items-center space-x-4 mt-2">
              <UserAvatar
                avatar={user.avatar}
                nickname={user.nickname}
                level={user.level}
                size={88}
              />
            </div>
            
            <div className="text-center mt-4">
              <h1 
                className="text-2xl font-bold tracking-tight"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                🏔️ {user.nickname}
              </h1>
              {user.level && (
                <div className="flex items-center mt-2">
                  <span 
                    className="px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${colors.warning.primary}20 0%, ${colors.warning.secondary}20 100%)`,
                      color: colors.warning.primary,
                      border: `1px solid ${colors.warning.primary}30`,
                    }}
                  >
                    ⭐ Lv.{user.level} 攀岩达人
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-4 mt-3 text-sm font-medium" style={{ color: colors.neutral[600] }}>
                {user.city && (
                  <span className="flex items-center gap-1">
                    <span>📍</span>{user.city}
                  </span>
                )}
                {user.climbingAge !== undefined && (
                  <span className="flex items-center gap-1">
                    <span>🕒</span>{user.climbingAge}年岩龄
                  </span>
                )}
              </div>
            </div>
          </div>

          {user.introduction && (
            <div 
              className="mt-4 pt-4 rounded-xl p-4"
              style={{
                background: `rgba(255, 255, 255, 0.4)`,
                border: `1px solid rgba(255, 255, 255, 0.6)`,
              }}
            >
              <p className="text-sm font-medium leading-relaxed" style={{ color: colors.neutral[700] }}>
                💭 {user.introduction}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditModalVisible(true)}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                color: 'white',
                boxShadow: shadows.medium,
              }}
            >
              ✏️ 编辑资料
            </button>
            
            <button
              onClick={handleLogout}
              className="py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                color: colors.error.primary,
                border: `1px solid ${colors.error.primary}30`,
                boxShadow: shadows.soft,
              }}
            >
              🚪 退出登录
            </button>
          </div>
        </div>

        {/* Enhanced Climbing Info Card */}
        {(user.climbingPreferences && user.climbingPreferences.length > 0) || 
         (user.frequentlyVisitedGyms && user.frequentlyVisitedGyms.length > 0) || 
         (user.gearTags && user.gearTags.length > 0) ? (
          <div 
            className="rounded-2xl backdrop-blur-sm overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
              boxShadow: shadows.large,
              border: `1px solid rgba(255, 255, 255, 0.5)`,
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: `rgba(255, 255, 255, 0.5)` }}>
              <h3 className="text-lg font-bold" style={{ color: colors.neutral[800] }}>
                🧗‍♀️ 攀岩信息
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: `rgba(255, 255, 255, 0.5)` }}>
              {user.climbingPreferences && user.climbingPreferences.length > 0 && (
                <div className="p-6 flex gap-4">
                  <span className="w-20 text-sm font-bold" style={{ color: colors.neutral[600] }}>
                    偏好类型
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {user.climbingPreferences.map((pref: string, index: number) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm"
                          style={{
                            background: `linear-gradient(135deg, ${colors.secondary[500]}20 0%, ${colors.secondary[600]}20 100%)`,
                            color: colors.secondary[600],
                            border: `1px solid ${colors.secondary[500]}30`,
                          }}
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {user.frequentlyVisitedGyms && user.frequentlyVisitedGyms.length > 0 && (
                <div className="p-6 flex gap-4">
                  <span className="w-20 text-sm font-bold" style={{ color: colors.neutral[600] }}>
                    常去岩馆
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {user.frequentlyVisitedGyms.map((gym: string, index: number) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary[500]}20 0%, ${colors.primary[600]}20 100%)`,
                            color: colors.primary[600],
                            border: `1px solid ${colors.primary[500]}30`,
                          }}
                        >
                          🏢 {gym}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {user.gearTags && user.gearTags.length > 0 && (
                <div className="p-6 flex gap-4">
                  <span className="w-20 text-sm font-bold" style={{ color: colors.neutral[600] }}>
                    装备标签
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {user.gearTags.map((gear: string, index: number) => (
                        <span 
                          key={index} 
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm"
                          style={{
                            background: `linear-gradient(135deg, ${colors.warning.primary}20 0%, ${colors.warning.secondary}20 100%)`,
                            color: colors.warning.primary,
                            border: `1px solid ${colors.warning.primary}30`,
                          }}
                        >
                          🎯 {gear}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Activity Statistics */}
        <div 
          className="rounded-2xl p-6 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.large,
            border: `1px solid rgba(255, 255, 255, 0.5)`,
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.neutral[800] }}>
            📊 活动统计
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.primary[600] }}>
                {userActivities.length}
              </div>
              <div className="text-sm" style={{ color: colors.neutral[600] }}>
                发起的活动
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.secondary[600] }}>
                {participatedActivities.length}
              </div>
              <div className="text-sm" style={{ color: colors.neutral[600] }}>
                参与的活动
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <NotificationPreferences />
      </div>

      {/* EditProfileModal */}
      {user && (
        <EditProfileModal 
          visible={editModalVisible} 
          onClose={() => setEditModalVisible(false)} 
        />
      )}
    </div>
  );
};

export default Profile; 