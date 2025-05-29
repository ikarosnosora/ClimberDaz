import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSelector, useUserActions } from '../../store/useOptimizedStore';
import { showSuccess, showError } from '../../utils/notifications';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import { UserAvatar } from '../../components';
import './Profile.css'; 
import NotificationPreferences from '../../components/Profile/NotificationPreferences';
import EditProfileModal from '../../components/Profile/EditProfileModal';
import type { IconProps } from '../../types';

// Icon Placeholders with proper typing
const IconPlaceholder = ({ name, className = "w-5 h-5" }: { name: string, className?: string }) => <span className={`inline-block text-gray-500 ${className}`}>[{name}]</span>;
const SetOutline = (props: IconProps) => <IconPlaceholder {...props} name="Set" />;
const TeamOutline = (props: IconProps) => <IconPlaceholder {...props} name="Team" />;
const StarOutline = (props: IconProps) => <IconPlaceholder {...props} name="Star" />;
const FlagOutline = (props: IconProps) => <IconPlaceholder {...props} name="Flag" />;
const MailOutline = (props: IconProps) => <IconPlaceholder {...props} name="Mail" />;
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserSelector();
  const { logout } = useUserActions();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      try {
        await logout();
        navigate('/login');
        showSuccess(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
      } catch (_error) {
        showError('退出登录失败，请重试');
      }
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleViewActivities = (type: 'hosted' | 'joined') => {
    navigate(`/my-activities?type=${type}`);
  };

  const handleViewReviews = () => {
    navigate('/my-reviews');
  };

  const handleSendFeedback = () => {
    window.location.href = "mailto:feedback@climberdaz.example.com?subject=ClimberDaz App Feedback";
    showSuccess('打开邮件客户端以发送反馈...');
  };

  if (!user) {
    return <div className="p-4 text-center">请先登录</div>; 
  }

  return (
    <div className="profile-page bg-gray-100 min-h-screen pb-16">
      {/* Custom NavBar */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4">
          <div className="relative flex items-center justify-center h-12">
            {/* No back arrow as per original NavBar backArrow={false} */}
            <h1 className="text-lg font-semibold text-gray-800">个人中心</h1>
            <button onClick={handleEditProfile} className="absolute right-0 p-2 text-blue-500 hover:text-blue-700" aria-label="Edit profile">
              <SetOutline className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content p-4 space-y-4">
        {/* User Info Card */}
        <div className="user-info-card bg-white shadow-lg rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <UserAvatar
              avatar={user.avatar}
              nickname={user.nickname}
              level={user.level}
              size={80}
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{user.nickname}</h2>
              {user.level && <div className="text-sm text-yellow-500">Lv.{user.level} 攀岩达人</div>}
              <div className="text-xs text-gray-500 mt-0.5">ID: {user.openid.slice(-8)}</div>
              {user.city && <div className="text-xs text-gray-500 mt-0.5">城市: {user.city}</div>}
              {user.climbingAge !== undefined && <div className="text-xs text-gray-500 mt-0.5">岩龄: {user.climbingAge}年</div>}
            </div>
          </div>
          {user.introduction && <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">简介: {user.introduction}</p>}
        </div>

        {/* Menu List */}
        <div className="menu-card bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Simulating List with divs */}
          <div onClick={() => handleViewActivities('hosted')} className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
            <FlagOutline className="mr-3 text-blue-500" />
            <span className="flex-1 text-gray-700">我发起的活动</span>
            <ChevronRightIcon />
          </div>
          <div onClick={() => handleViewActivities('joined')} className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
            <TeamOutline className="mr-3 text-green-500" />
            <span className="flex-1 text-gray-700">我参与的活动</span>
            <ChevronRightIcon />
          </div>
          <div onClick={handleViewReviews} className="flex items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50">
            <StarOutline className="mr-3 text-yellow-500" />
            <span className="flex-1 text-gray-700">我的评价</span>
            <ChevronRightIcon />
          </div>
          <div onClick={handleSendFeedback} className="flex items-center p-4 cursor-pointer hover:bg-gray-50">
            <MailOutline className="mr-3 text-purple-500" />
            <span className="flex-1 text-gray-700">发送反馈</span>
            <ChevronRightIcon />
          </div>
        </div>

        {/* Notification Settings Card - title was part of antd Card, now a separate header */}
        <div className="notification-settings-card bg-white shadow-lg rounded-lg">
          <h3 className="text-md font-semibold text-gray-700 p-4 border-b border-gray-200">通知设置</h3>
          <div className="p-4">
            <NotificationPreferences />
          </div>
        </div>

        {/* Climbing Info Card */}
        {(user.climbingPreferences && user.climbingPreferences.length > 0) || (user.frequentlyVisitedGyms && user.frequentlyVisitedGyms.length > 0) || (user.gearTags && user.gearTags.length > 0) ? (
          <div className="climbing-info-card bg-white shadow-lg rounded-lg">
            <h3 className="text-md font-semibold text-gray-700 p-4 border-b border-gray-200">攀爬信息</h3>
            <div className="divide-y divide-gray-200">
              {user.climbingPreferences && user.climbingPreferences.length > 0 && (
                 <div className="p-4 flex">
                   <span className="w-24 text-sm text-gray-500 font-medium">偏好类型</span>
                   <span className="text-sm text-gray-700">{user.climbingPreferences.join(', ')}</span>
                 </div>
              )}
              {user.frequentlyVisitedGyms && user.frequentlyVisitedGyms.length > 0 && (
                <div className="p-4 flex">
                  <span className="w-24 text-sm text-gray-500 font-medium">常去岩馆</span>
                  <span className="text-sm text-gray-700">{user.frequentlyVisitedGyms.join(', ')}</span>
                </div>
              )}
              {user.gearTags && user.gearTags.length > 0 && (
                <div className="p-4 flex">
                  <span className="w-24 text-sm text-gray-500 font-medium">我的装备</span>
                  <span className="text-sm text-gray-700">{user.gearTags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Action Section */}
        <div className="action-section mt-6 mb-2">
          <button
            className="w-full py-3 px-4 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            onClick={handleLogout}
          >
            退出登录
          </button>
        </div>
      </div>

      {/* EditProfileModal remains, assuming it handles its own visibility and antd-mobile parts if any */}
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