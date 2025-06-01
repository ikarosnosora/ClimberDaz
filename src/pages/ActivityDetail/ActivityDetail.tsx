import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import {
//   NavBar,
//   Card,
//   Button,
//   Space,
//   Tag,
//   Dialog,
//   Toast,
//   Empty,
// } from 'antd-mobile'; // Removed antd-mobile components
// import {
//   ClockCircleOutline,
//   LocationFill,
//   UserOutline,
//   MessageOutline,
// } from 'antd-mobile-icons'; // Removed antd-mobile icons
import dayjs from 'dayjs';
import { useActivitySelector, useActivityActions, useUserSelector } from '../../store/useOptimizedStore';
import { showSuccess, showError } from '../../utils/notifications';
import { UserAvatar } from '../../components';
import { colors, shadows } from '../../utils/designSystem';
import type { Participation, Comment, Activity } from '../../types';
import { MeetMode, CostMode } from '../../types';
import './ActivityDetail.css';

// Enhanced Icon Components with gradient styling
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`text-primary-600 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const LocationIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-secondary-600 ${className}`}>
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.92 16.92 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`text-accent-600 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const MessageIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`text-neutral-600 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

// Mock data (remains the same)
const mockParticipants: Participation[] = [
  { activityId: '1', userId: 'user2', joinTime: new Date(), user: { openid: 'user2', nickname: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', level: 3, gearTags: [], createdAt: new Date() } },
  { activityId: '1', userId: 'user3', joinTime: new Date(), user: { openid: 'user3', nickname: 'Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', level: 2, gearTags: [], createdAt: new Date() } },
];

const mockComments: Comment[] = [
  {
    id: '1',
    activityId: '1',
    userId: 'user2',
    content: '期待！我会准时到的',
    timestamp: new Date(),
    user: {
      openid: 'user2',
      nickname: 'Alice',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      level: 3,
      gearTags: [],
      createdAt: new Date(),
    },
  },
];

// Enhanced Tag Component with gradients
const EnhancedTag: React.FC<{ 
  type?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'; 
  children: React.ReactNode; 
  className?: string 
}> = ({ type = 'default', children, className = '' }) => {
  const getTagStyles = () => {
    switch (type) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`,
          color: colors.primary[700],
          border: `1px solid ${colors.primary[300]}`,
        };
      case 'success':
        return {
          background: `linear-gradient(135deg, ${colors.success.subtle} 0%, ${colors.success.soft} 100%)`,
          color: colors.success.primary,
          border: `1px solid ${colors.success.primary}`,
        };
      case 'warning':
        return {
          background: `linear-gradient(135deg, ${colors.warning.subtle} 0%, ${colors.warning.soft} 100%)`,
          color: colors.warning.primary,
          border: `1px solid ${colors.warning.primary}`,
        };
      case 'error':
        return {
          background: `linear-gradient(135deg, ${colors.error.subtle} 0%, ${colors.error.soft} 100%)`,
          color: colors.error.primary,
          border: `1px solid ${colors.error.primary}`,
        };
      case 'info':
        return {
          background: `linear-gradient(135deg, ${colors.info.subtle} 0%, ${colors.info.soft} 100%)`,
          color: colors.info.primary,
          border: `1px solid ${colors.info.primary}`,
        };
      default:
        return {
          background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
          color: colors.neutral[700],
          border: `1px solid ${colors.neutral[300]}`,
        };
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-xl backdrop-blur-sm ${className}`}
      style={getTagStyles()}
    >
      {children}
    </span>
  );
};

// Enhanced Empty State Component
const EnhancedEmpty: React.FC<{ 
  description: string; 
  icon?: string;
  className?: string 
}> = ({ description, icon = '🧗‍♀️', className = '' }) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center text-center p-12 rounded-2xl backdrop-blur-sm ${className}`}
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
        boxShadow: shadows.card,
      }}
    >
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-lg font-semibold" style={{ color: colors.neutral[600] }}>
        {description}
      </p>
    </div>
  );
};

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities } = useActivitySelector();
  const { setCurrentActivity } = useActivityActions();
  const { user } = useUserSelector();
  
  // Local state for current activity to avoid issues with zustand async updates if needed
  const [localCurrentActivity, setLocalCurrentActivity] = useState<Activity | undefined>(undefined);

  const [participants, setParticipants] = useState<Participation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]); // Comments state is here, but rendering part is not visible
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activity = activities.find((a) => a.id === id);
    if (activity) {
      setLocalCurrentActivity(activity);
      setCurrentActivity(activity); // Also update zustand store if needed by other components
      // Load mock data
      if (activity.id === '1') { // Assuming activity.id can be string or number, ensure comparison is correct
        setParticipants(mockParticipants);
        setComments(mockComments);
         // Check if current user has joined, based on mockParticipants
        setIsJoined(mockParticipants.some((p) => p.userId === user?.openid));
      } else {
        // Reset for other activities if not using their specific mock data
        setParticipants([]);
        setComments([]);
        setIsJoined(activity.participantIds?.includes(user?.openid || '') || false); 
      }
    } else {
      setLocalCurrentActivity(undefined);
      setCurrentActivity(null);
    }
  }, [id, activities, setCurrentActivity, user]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleJoin = async () => {
    if (!user || !localCurrentActivity) return;
    
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newParticipation: Participation = {
        activityId: localCurrentActivity.id,
        userId: user.openid,
        joinTime: new Date(),
        user: user
      };
      
      setParticipants([...participants, newParticipation]);
      setIsJoined(true);
      showSuccess('报名成功！');
    } catch (_error) {
      showError('报名失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user || !localCurrentActivity) return;

    if (window.confirm('确定要取消报名吗？')) {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setParticipants(participants.filter((p) => p.userId !== user.openid));
        setIsJoined(false);
        showSuccess('已取消报名');
      } catch (_error) {
        showError('取消失败，请重试');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleCommentClick = () => {
    navigate(`/comment-board/${id}`);
  };

  if (!localCurrentActivity) {
    return (
      <div 
        className="min-h-screen p-6"
        style={{
          background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
        }}
      >
        {/* Enhanced NavBar */}
        <div 
          className="bg-white shadow-sm sticky top-0 z-10 mb-6 rounded-2xl backdrop-blur-lg"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
            boxShadow: shadows.medium,
          }}
        >
          <div className="px-6 py-4">
            <div className="relative flex items-center justify-center">
              <button 
                onClick={handleBack} 
                className="absolute left-0 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
                  color: colors.primary[600],
                }}
                aria-label="Go back"
              >
                <BackIcon />
              </button>
              <h1 
                className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
                }}
              >
                🧗‍♀️ 活动详情
              </h1>
            </div>
          </div>
        </div>
        <EnhancedEmpty description="活动不存在" icon="🤔" />
      </div>
    );
  }

  const isHost = user?.openid === localCurrentActivity.hostId;
  const isFull = participants.length >= localCurrentActivity.slotMax;
  const isStarted = dayjs(localCurrentActivity.datetime).isBefore(dayjs());
  const canJoin = !isHost && !isJoined && !isFull && !isStarted;
  const canCancel = isJoined && !isHost && !isStarted;

  return (
    <div 
      className="min-h-screen pb-24 p-6"
      style={{
        background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
      }}
    >
      {/* Enhanced NavBar */}
      <div 
        className="bg-white shadow-sm sticky top-0 z-10 mb-6 rounded-2xl backdrop-blur-lg"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
          border: `1px solid rgba(255, 255, 255, 0.3)`,
          boxShadow: shadows.medium,
        }}
      >
        <div className="px-6 py-4">
          <div className="relative flex items-center justify-center">
            <button 
              onClick={handleBack} 
              className="absolute left-0 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
                color: colors.primary[600],
              }}
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <h1 
              className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
              }}
            >
              🧗‍♀️ 活动详情
            </h1>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Enhanced Activity Info Card */}
        <div 
          className="p-6 rounded-2xl backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.card,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: colors.neutral[800] }}
          >
            {localCurrentActivity.title}
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)` }}
              >
                <ClockIcon className="w-5 h-5" />
              </div>
              <span className="font-medium" style={{ color: colors.neutral[700] }}>
                {dayjs(localCurrentActivity.datetime).format('MM月DD日 HH:mm')}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colors.secondary[100]} 0%, ${colors.secondary[200]} 100%)` }}
              >
                <LocationIcon className="w-5 h-5" />
              </div>
              <span className="font-medium" style={{ color: colors.neutral[700] }}>
                {localCurrentActivity.locationText}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colors.accent[100]} 0%, ${colors.accent[200]} 100%)` }}
              >
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: colors.neutral[700] }}>
                  {participants.length}/{localCurrentActivity.slotMax}人
                </span>
                {isFull && <EnhancedTag type="warning">已满员</EnhancedTag>}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <EnhancedTag type="primary">
              {localCurrentActivity.meetMode === MeetMode.MEET_AT_ENTRANCE ? '🚪 门口集合' : '🏃‍♀️ 先到先攀'}
            </EnhancedTag>
            <EnhancedTag type="success">
              {localCurrentActivity.costMode === CostMode.FREE ? '🆓 免费' : 
               localCurrentActivity.costMode === CostMode.AA ? '💰 AA' : '🎁 我请客'}
            </EnhancedTag>
            {localCurrentActivity.isPrivate && <EnhancedTag type="warning">🔒 私密活动</EnhancedTag>}
          </div>
        </div>

        {/* Enhanced Host Card */}
        <div 
          className="p-6 rounded-2xl backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.card,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
          onClick={() => handleViewProfile(localCurrentActivity.hostId)}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.neutral[700] }}>
            👨‍💼 发起人
          </h3>
          <div className="flex items-center space-x-4">
            <UserAvatar
              avatar={localCurrentActivity.host?.avatar}
              nickname={localCurrentActivity.host?.nickname || '发起人'}
              level={localCurrentActivity.host?.level}
              size={56}
            />
            <div>
              <div className="text-lg font-bold" style={{ color: colors.neutral[800] }}>
                {localCurrentActivity.host?.nickname || '发起人'}
              </div>
              <div className="text-sm font-medium" style={{ color: colors.neutral[500] }}>
                Lv.{localCurrentActivity.host?.level || 1} 攀岩者
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Participants Card */}
        <div 
          className="p-6 rounded-2xl backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.card,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.neutral[700] }}>
            👥 参与者 ({participants.length})
          </h3>
          {participants.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition-all duration-200 p-3 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)`,
                  }}
                  onClick={() => handleViewProfile(p.userId)}
                >
                  <UserAvatar
                    avatar={p.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`}
                    nickname={p.user?.nickname || p.userId}
                    size={48}
                  />
                  <span 
                    className="text-xs mt-2 font-medium text-center max-w-16 truncate"
                    style={{ color: colors.neutral[600] }}
                  >
                    {p.user?.nickname || p.userId}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EnhancedEmpty description="暂无其他参与者" icon="👥" className="py-8" />
          )}
        </div>

        {/* Enhanced Comments Preview */}
        <div 
          className="p-6 rounded-2xl backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.card,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
          onClick={handleCommentClick}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: colors.neutral[700] }}>
              💬 留言板 ({comments.length})
            </h3>
            <div 
              className="p-2 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)` }}
            >
              <MessageIcon className="w-5 h-5" />
            </div>
          </div>
          {comments.length > 0 && localCurrentActivity && localCurrentActivity.comments && localCurrentActivity.comments.length > 0 ? (
            <div className="text-sm" style={{ color: colors.neutral[600] }}>
              <strong style={{ color: colors.neutral[800] }}>
                {localCurrentActivity.comments[0].user?.nickname || 'User'}:
              </strong> {localCurrentActivity.comments[0].content}
              {localCurrentActivity.comments.length > 1 && (
                <span className="text-xs ml-2" style={{ color: colors.neutral[400] }}>
                  ...和更多
                </span>
              )}
            </div>
          ) : comments.length > 0 ? (
            <div className="text-sm" style={{ color: colors.neutral[600] }}>
                <strong style={{ color: colors.neutral[800] }}>
                  {comments[0].user?.nickname || 'User'}:
                </strong> {comments[0].content}
                {comments.length > 1 && (
                  <span className="text-xs ml-2" style={{ color: colors.neutral[400] }}>
                    ...和更多
                  </span>
                )}
            </div>
          ) : (
            <p className="text-sm" style={{ color: colors.neutral[500] }}>
              暂无留言，点击查看或添加。
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Bottom Action Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-6 z-10 max-w-md mx-auto backdrop-blur-lg"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
          border: `1px solid rgba(255, 255, 255, 0.3)`,
          boxShadow: `${shadows.large}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
        }}
      >
        {isHost ? (
          <button 
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${colors.neutral[300]} 0%, ${colors.neutral[400]} 100%)`,
              color: colors.neutral[600],
            }}
            disabled
          >
            👑 你是发起人
          </button>
        ) : isStarted ? (
          <button 
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${colors.neutral[300]} 0%, ${colors.neutral[400]} 100%)`,
              color: colors.neutral[600],
            }}
            disabled
          >
            ⏰ 活动已开始
          </button>
        ) : canJoin ? (
          <button
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            style={{
              background: loading 
                ? `linear-gradient(135deg, ${colors.neutral[400]} 0%, ${colors.neutral[500]} 100%)`
                : `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[600]} 100%)`,
              boxShadow: loading ? shadows.soft : shadows.medium,
            }}
            disabled={loading}
            onClick={handleJoin}
          >
            {loading ? '⏳ 处理中...' : '🚀 立即报名'}
          </button>
        ) : canCancel ? (
          <button
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            style={{
              background: loading 
                ? `linear-gradient(135deg, ${colors.neutral[300]} 0%, ${colors.neutral[400]} 100%)`
                : `linear-gradient(135deg, ${colors.error.primary} 0%, ${colors.error.secondary} 100%)`,
              boxShadow: loading ? shadows.soft : shadows.medium,
            }}
            disabled={loading}
            onClick={handleCancel}
          >
            {loading ? '⏳ 处理中...' : '❌ 取消报名'}
          </button>
        ) : isFull ? (
          <button 
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${colors.warning.soft} 0%, ${colors.warning.subtle} 100%)`,
              color: colors.warning.primary,
            }}
            disabled
          >
            🈵 已满员
          </button>
        ) : isJoined && !isHost ? (
           <button 
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${colors.success.primary} 0%, ${colors.success.secondary} 100%)`,
              boxShadow: shadows.soft,
            }}
            disabled
          >
            ✅ 已报名
          </button>
        ) : (
          <button 
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${colors.neutral[300]} 0%, ${colors.neutral[400]} 100%)`,
              color: colors.neutral[600],
            }}
            disabled
          >
            🚫 暂不可操作
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityDetail; 