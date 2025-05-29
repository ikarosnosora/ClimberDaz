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
import type { Participation, Comment, Activity, IconProps } from '../../types'; // Added Activity type and IconProps
import { MeetMode, CostMode } from '../../types';
import './ActivityDetail.css';

// Icon Placeholders with proper typing
const IconPlaceholder = ({ name, className = "w-5 h-5 inline-block" }: { name: string, className?: string }) => <span className={`text-gray-500 ${className}`}>[{name}]</span>;
const ClockCircleOutline = (props: IconProps) => <IconPlaceholder {...props} name="Time" />;
const LocationFill = (props: IconProps) => <IconPlaceholder {...props} name="LocPin" />;
const UserOutline = (props: IconProps) => <IconPlaceholder {...props} name="User" />;
const MessageOutline = (props: IconProps) => <IconPlaceholder {...props} name="Chat" />; // Added placeholder for MessageOutline

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

// Tailwind Tag Component (similar to ActivityCard)
const TailwindTag: React.FC<{ color?: string; children: React.ReactNode; className?: string; antdColor?: string }> = ({ color, children, className, antdColor }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-700';

  if (color === 'warning' || antdColor === 'warning') {
    bgColor = 'bg-yellow-400';
    textColor = 'text-yellow-800';
  } else if (color === 'primary' || antdColor === 'primary') {
    bgColor = 'bg-blue-500';
    textColor = 'text-white';
  } else if (color === 'success' || antdColor === 'success') {
    bgColor = 'bg-green-500';
    textColor = 'text-white';
  }
  // Add more color mappings as needed

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${bgColor} ${textColor} ${className || ''}`}>
      {children}
    </span>
  );
};

// Custom Empty state component
const CustomEmpty: React.FC<{ description: string; imageStyle?: React.CSSProperties; className?: string }> = ({ description, imageStyle, className }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 text-gray-500 ${className || ''}`}>
      <div className="text-4xl mb-4" style={imageStyle}>📭</div> {/* Basic placeholder icon */}
      <p>{description}</p>
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
    navigate(`/activity/${id}/comments`);
  };

  if (!localCurrentActivity) { // Use localCurrentActivity for checks
    return (
      <div className="activity-detail-page bg-gray-100 min-h-screen">
        {/* Custom NavBar */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4">
            <div className="relative flex items-center justify-center h-12">
              <button onClick={handleBack} className="absolute left-0 p-2 text-blue-500 hover:text-blue-700" aria-label="Go back">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-800">活动详情</h1>
            </div>
          </div>
        </div>
        <CustomEmpty description="活动不存在" />
      </div>
    );
  }

  const isHost = user?.openid === localCurrentActivity.hostId;
  const isFull = participants.length >= localCurrentActivity.slotMax;
  const isStarted = dayjs(localCurrentActivity.datetime).isBefore(dayjs());
  const canJoin = !isHost && !isJoined && !isFull && !isStarted;
  const canCancel = isJoined && !isHost && !isStarted;

  return (
    <div className="activity-detail-page bg-gray-100 min-h-screen pb-20">
      {/* Custom NavBar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4">
          <div className="relative flex items-center justify-center h-12">
            <button onClick={handleBack} className="absolute left-0 p-2 text-blue-500 hover:text-blue-700" aria-label="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">活动详情</h1>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Activity Info Card */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-3">{localCurrentActivity.title}</h2>
          
          {/* Replaced Space with flex column and spacing */}
          <div className="space-y-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <ClockCircleOutline className="mr-2 text-gray-500" />
              <span>{dayjs(localCurrentActivity.datetime).format('MM月DD日 HH:mm')}</span>
            </div>
            
            <div className="flex items-center">
              <LocationFill className="mr-2 text-gray-500" />
              <span>{localCurrentActivity.locationText}</span>
            </div>
            
            <div className="flex items-center">
              <UserOutline className="mr-2 text-gray-500" />
              <span>
                {participants.length}/{localCurrentActivity.slotMax}人
                {isFull && <TailwindTag antdColor="warning" className="ml-2">已满员</TailwindTag>}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <TailwindTag antdColor="primary">
              {localCurrentActivity.meetMode === MeetMode.MEET_AT_ENTRANCE ? '门口集合' : '先到先攀'}
            </TailwindTag>
            <TailwindTag antdColor="success">
              {localCurrentActivity.costMode === CostMode.FREE ? '免费' : 
               localCurrentActivity.costMode === CostMode.AA ? 'AA' : '我请客'}
            </TailwindTag>
            {localCurrentActivity.isPrivate && <TailwindTag antdColor="warning">私密活动</TailwindTag>}
          </div>
        </div>

        {/* Host Card */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <div className="mb-2">
            <span className="text-md font-semibold text-gray-700">发起人</span>
          </div>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleViewProfile(localCurrentActivity.hostId)}>
            <UserAvatar
              avatar={localCurrentActivity.host?.avatar}
              nickname={localCurrentActivity.host?.nickname || '发起人'}
              level={localCurrentActivity.host?.level}
              size={48}
            />
            <div>
              <div className="font-semibold text-gray-800">{localCurrentActivity.host?.nickname || '发起人'}</div>
              <div className="text-xs text-gray-500">Lv.{localCurrentActivity.host?.level || 1}</div>
            </div>
          </div>
        </div>

        {/* Participants Card */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <div className="mb-2">
            <span className="text-md font-semibold text-gray-700">参与者 ({participants.length})</span>
            {/* TODO: Add a "View All" button if list is long and truncated */}
          </div>
          {participants.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition-transform duration-150"
                  onClick={() => handleViewProfile(p.userId)}
                >
                  <UserAvatar
                    avatar={p.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`}
                    nickname={p.user?.nickname || p.userId}
                    size={40} // Level display on small avatars might be too cluttered, consider showing on profile page
                  />
                  <span className="text-xs mt-1 text-gray-600 truncate w-16 text-center">{p.user?.nickname || p.userId}</span>
                </div>
              ))}
            </div>
          ) : (
            <CustomEmpty description="暂无其他参与者" className="py-4" imageStyle={{ width: 60 }} />
          )}
        </div>

        {/* Comments Preview */}
        <div className="bg-white shadow-lg rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={handleCommentClick}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-md font-semibold text-gray-700">留言板 ({comments.length})</span>
            <MessageOutline className="text-gray-400" />
          </div>
          {comments.length > 0 && localCurrentActivity && localCurrentActivity.comments && localCurrentActivity.comments.length > 0 ? (
            // Display first comment from actual activity data if available, else from mock
            // Assuming localCurrentActivity.comments has a similar structure to mockComments
            <div className="text-sm text-gray-600">
              <strong className="text-gray-800">{localCurrentActivity.comments[0].user?.nickname || 'User'}:</strong> {localCurrentActivity.comments[0].content}
              {localCurrentActivity.comments.length > 1 && <span className="text-xs text-gray-400 ml-2">...和更多</span>}
            </div>
          ) : comments.length > 0 ? ( // Fallback to mock comments if activity.comments is empty but mock exists
            <div className="text-sm text-gray-600">
                <strong className="text-gray-800">{comments[0].user?.nickname || 'User'}:</strong> {comments[0].content}
                {comments.length > 1 && <span className="text-xs text-gray-400 ml-2">...和更多</span>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无留言，点击查看或添加。</p>
          )}
        </div>
      </div>

      {/* Bottom Action Bar - Refactored with Tailwind CSS */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-3 shadow-top z-10 max-w-md mx-auto border-t border-gray-200">
        {isHost ? (
          <button className="w-full py-3 px-4 rounded-lg bg-gray-300 text-gray-600 font-semibold cursor-not-allowed" disabled>
            你是发起人
          </button>
        ) : isStarted ? (
          <button className="w-full py-3 px-4 rounded-lg bg-gray-300 text-gray-600 font-semibold cursor-not-allowed" disabled>
            活动已开始
          </button>
        ) : canJoin ? (
          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
            disabled={loading}
            onClick={handleJoin}
          >
            {loading ? '处理中...' : '立即报名'}
          </button>
        ) : canCancel ? (
          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold ${loading ? 'bg-gray-200 text-gray-500' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            disabled={loading}
            onClick={handleCancel}
          >
            {loading ? '处理中...' : '取消报名'}
          </button>
        ) : isFull ? (
          <button className="w-full py-3 px-4 rounded-lg bg-gray-300 text-gray-600 font-semibold cursor-not-allowed" disabled>
            已满员
          </button>
        ) : isJoined && !isHost ? ( // Case: Already joined, but activity not started (canCancel might be false if other conditions apply, this is a fallback display)
           <button className="w-full py-3 px-4 rounded-lg bg-green-500 text-white font-semibold cursor-not-allowed" disabled>
            已报名
          </button>
        ) : (
          <button className="w-full py-3 px-4 rounded-lg bg-gray-300 text-gray-600 font-semibold cursor-not-allowed" disabled>
            暂不可操作
          </button>
        ) }
      </div>
    </div>
  );
};

export default ActivityDetail; 