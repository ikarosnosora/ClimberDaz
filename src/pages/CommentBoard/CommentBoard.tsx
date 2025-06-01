import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useStore } from '../../store/useStore';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import { colors, shadows } from '../../utils/designSystem';
import { showSuccess, showError } from '../../utils/notifications';
import type { Comment } from '../../types';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// Enhanced Back Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// Enhanced Loading Animation
const LoadingPlaceholder: React.FC = () => (
  <div className="animate-pulse p-4 rounded-2xl backdrop-blur-sm" style={{
    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)`,
  }}>
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)` }}></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded" style={{ background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)`, width: '60%' }}></div>
        <div className="h-3 rounded" style={{ background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)`, width: '80%' }}></div>
      </div>
    </div>
  </div>
);

// Enhanced Empty State
const EnhancedEmpty: React.FC<{ description: string }> = ({ description }) => (
  <div 
    className="flex flex-col items-center justify-center text-center p-12 rounded-2xl backdrop-blur-sm mx-6"
    style={{
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
      boxShadow: shadows.card,
    }}
  >
    <div className="text-6xl mb-4">💬</div>
    <p className="text-lg font-semibold" style={{ color: colors.neutral[600] }}>
      {description}
    </p>
  </div>
);

// Enhanced Comment Item Component
const EnhancedCommentItem: React.FC<{
  comment: Comment;
  isHost: boolean;
  onUserClick: () => void;
}> = ({ comment, isHost, onUserClick }) => (
  <div 
    className="p-4 rounded-2xl backdrop-blur-sm mb-4 transition-all duration-300 hover:scale-[1.01]"
    style={{
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
      boxShadow: shadows.card,
      border: `1px solid rgba(255, 255, 255, 0.3)`,
    }}
  >
    <div className="flex items-start gap-3">
      <div onClick={onUserClick} className="cursor-pointer transform hover:scale-110 transition-all duration-200">
        <UserAvatar
          avatar={comment.user?.avatar}
          nickname={comment.user?.nickname || '用户'}
          level={comment.user?.level}
          size={44}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: colors.neutral[800] }}>
              {comment.user?.nickname || '用户'}
            </span>
            {isHost && (
              <span 
                className="px-2 py-1 text-xs font-semibold rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`,
                  color: colors.primary[700],
                }}
              >
                👑 发起人
              </span>
            )}
          </div>
          <span className="text-xs font-medium" style={{ color: colors.neutral[500] }}>
            {dayjs(comment.timestamp).fromNow()}
          </span>
        </div>
        <div className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap" style={{ color: colors.neutral[700] }}>
          {comment.content}
        </div>
      </div>
    </div>
  </div>
);

// Enhanced TextArea Component
const EnhancedTextArea: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
}> = ({ placeholder, value, onChange, maxLength, disabled }) => (
  <div className="relative">
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      disabled={disabled}
      rows={2}
      className="w-full px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ease-smooth focus:outline-none focus:ring-4 backdrop-blur-sm resize-none"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
        border: `2px solid ${colors.neutral[200]}`,
        backdropFilter: 'blur(10px)',
        boxShadow: shadows.soft,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = colors.primary[400];
        e.target.style.boxShadow = `0 0 0 4px ${colors.primary[100]}`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = colors.neutral[200];
        e.target.style.boxShadow = shadows.soft;
      }}
    />
    <div className="absolute bottom-2 right-3 text-xs font-medium" style={{ color: colors.neutral[400] }}>
      {value.length}/{maxLength}
    </div>
  </div>
);

// Mock comments data
const mockComments: Comment[] = [
  {
    id: '1',
    activityId: '1',
    userId: 'user2',
    content: '期待！我会准时到的，大家记得带好装备哦～ 🧗‍♀️',
    timestamp: new Date(Date.now() - 3600000),
    user: {
      openid: 'user2',
      nickname: 'Alice',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      level: 3,
      gearTags: [],
      createdAt: new Date(),
    },
  },
  {
    id: '2',
    activityId: '1',
    userId: 'user3',
    content: '请问新手可以参加吗？我只爬过V2的线路 🤔',
    timestamp: new Date(Date.now() - 7200000),
    user: {
      openid: 'user3',
      nickname: 'Bob',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      level: 1,
      gearTags: [],
      createdAt: new Date(),
    },
  },
  {
    id: '3',
    activityId: '1',
    userId: 'user1',
    content: '当然可以！我们会互相帮助的，新手也欢迎 🏔️',
    timestamp: new Date(Date.now() - 6000000),
    user: {
      openid: 'user1',
      nickname: '发起人',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host',
      level: 5,
      gearTags: [],
      createdAt: new Date(),
    },
  },
];

const CommentBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, currentActivity } = useStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const activityComments = mockComments.filter(
        (comment) => comment.activityId === id
      );
      setComments(activityComments);
    } catch (_error) {
      showError('加载评论失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadComments();
  }, [id, loadComments]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      showError('请输入评论内容');
      return;
    }

    if (!user) {
      showError('请先登录');
      navigate('/login');
      return;
    }

    if (newComment.length > 100) {
      showError('评论不能超过100字');
      return;
    }

    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const comment: Comment = {
        id: `comment_${Date.now()}`,
        activityId: id!,
        userId: user.openid,
        content: newComment.trim(),
        timestamp: new Date(),
        user: user,
      };

      setComments([comment, ...comments]);
      setNewComment('');
      
      showSuccess('发送成功');
    } catch (_error) {
      showError('发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const isHost = (userId: string) => {
    return userId === currentActivity?.hostId;
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
      }}
    >
      {/* Enhanced NavBar */}
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
            <button 
              onClick={handleBack} 
              className="absolute left-0 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
                color: colors.primary[600],
              }}
            >
              <BackIcon />
            </button>
            <h1 
              className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
              }}
            >
              💬 留言板
            </h1>
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="flex-1 overflow-y-auto pb-32 px-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(key => (
              <LoadingPlaceholder key={key} />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="pt-10">
            <EnhancedEmpty description="暂无留言，快来抢沙发！" />
          </div>
        ) : (
          <div>
            {comments.map((comment) => (
              <EnhancedCommentItem
                key={comment.id}
                comment={comment}
                isHost={isHost(comment.userId)}
                onUserClick={() => handleUserClick(comment.userId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Bottom Input Area */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-6 z-40 backdrop-blur-lg"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
          border: `1px solid rgba(255, 255, 255, 0.3)`,
          boxShadow: `${shadows.large}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
        }}
      >
        <div className="flex items-end gap-3 max-w-md mx-auto">
          <div className="flex-1">
            <EnhancedTextArea
              placeholder="💭 说点什么..."
              value={newComment}
              onChange={setNewComment}
              maxLength={100}
              disabled={sending}
            />
          </div>
          <button
            onClick={handleSendComment}
            disabled={!newComment.trim() || sending}
            className="px-6 py-3 text-sm font-bold text-white rounded-2xl transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              background: !newComment.trim() || sending
                ? `linear-gradient(135deg, ${colors.neutral[400]} 0%, ${colors.neutral[500]} 100%)`
                : `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[600]} 100%)`,
              boxShadow: !newComment.trim() || sending ? shadows.soft : shadows.medium,
            }}
          >
            {sending && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {sending ? '发送中...' : '🚀 发送'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentBoard; 