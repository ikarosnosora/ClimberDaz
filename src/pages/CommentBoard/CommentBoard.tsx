import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { TextArea, Button, Empty, Toast, Skeleton } from 'antd-mobile'; // Temporarily keep others
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useStore } from '../../store/useStore';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import type { Comment } from '../../types';
import NavBar from '../../components/NavBar/NavBar';
import CommentList from '../../components/CommentList/CommentList';
import CommentListItem from '../../components/CommentList/CommentListItem';
import TextArea from '../../components/TextArea/TextArea'; // Import new TextArea
import Button from '../../components/Button/Button'; // Import new Button
import EmptyState from '../../components/EmptyState/EmptyState'; // Import new EmptyState
import { useToast } from '../../components/Toast'; // Import useToast

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// Mock comments data
const mockComments: Comment[] = [
  {
    id: '1',
    activityId: '1',
    userId: 'user2',
    content: '期待！我会准时到的，大家记得带好装备哦～',
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
    content: '请问新手可以参加吗？我只爬过V2的线路',
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
    content: '当然可以！我们会互相帮助的，新手也欢迎',
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

// Replace SkeletonPlaceholder usage with simple loading indicators
const LoadingPlaceholder: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);

const CommentBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, currentActivity } = useStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const toast = useToast(); // Initialize useToast

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Filter mock comments for current activity
      const activityComments = mockComments.filter(
        (comment) => comment.activityId === id
      );
      setComments(activityComments);
    } catch (_error) {
      // Toast.show({ content: '加载评论失败', position: 'center', icon: 'fail' });
      toast.show({ content: '加载评论失败', position: 'center', icon: 'fail' });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadComments();
  }, [id, loadComments]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) {
      // Toast.show({ content: '请输入评论内容', position: 'center', icon: 'fail' });
      toast.show({ content: '请输入评论内容', position: 'center', icon: 'fail' });
      return;
    }

    if (!user) {
      // Toast.show({ content: '请先登录', position: 'center', icon: 'fail' });
      toast.show({ content: '请先登录', position: 'center', icon: 'fail' });
      navigate('/login');
      return;
    }

    if (newComment.length > 100) {
      // Toast.show({ content: '评论不能超过100字', position: 'center', icon: 'fail' });
      toast.show({ content: '评论不能超过100字', position: 'center', icon: 'fail' });
      return;
    }

    setSending(true);
    try {
      // Simulate API call
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
      
      // Toast.show({
      //   content: '发送成功',
      //   position: 'center',
      //   icon: 'success',
      // });
      toast.show({
        content: '发送成功',
        position: 'center',
        icon: 'success',
      });
    } catch (_error) {
      // Toast.show({ content: '发送失败，请重试', position: 'center', icon: 'fail' });
      toast.show({ content: '发送失败，请重试', position: 'center', icon: 'fail' });
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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavBar onBack={handleBack} title="留言板" />

      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="pt-4">
            {[1, 2, 3].map(key => (
              <CommentListItem
                key={key}
                prefix={<LoadingPlaceholder />}
                description={
                  <LoadingPlaceholder />
                }
              >
                <LoadingPlaceholder />
              </CommentListItem>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="pt-10">
            <EmptyState description="暂无留言，快来抢沙发！" />
          </div>
        ) : (
          <CommentList>
            {comments.map((comment) => (
              <CommentListItem
                key={comment.id}
                prefix={
                  <div onClick={() => handleUserClick(comment.userId)} className="cursor-pointer">
                    <UserAvatar
                      avatar={comment.user?.avatar}
                      nickname={comment.user?.nickname || '用户'}
                      level={comment.user?.level}
                      size={40}
                    />
                  </div>
                }
                description={ 
                  <div className="flex items-center">
                    <span className="text-xs">
                      {dayjs(comment.timestamp).fromNow()}
                    </span>
                    {isHost(comment.userId) && (
                      <span className="ml-auto px-1.5 py-0.5 text-xs bg-sky-100 text-sky-700 rounded-full font-medium">
                        发起人
                      </span>
                    )}
                  </div>
                }
              >
                <div className="flex items-center mb-0.5">
                  <span className="font-medium text-gray-900 text-[15px] truncate">
                    {comment.user?.nickname || '用户'}
                  </span>
                </div>
                <div className="text-sm text-gray-700 leading-normal break-words whitespace-pre-wrap">
                  {comment.content}
                </div>
              </CommentListItem>
            ))}
          </CommentList>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-end gap-3 z-40">
        <div className="flex-1">
          <TextArea
            placeholder="说点什么..."
            value={newComment}
            onChange={setNewComment}
            rows={2}
            maxLength={100}
            disabled={sending}
          />
        </div>
        <Button
          variant="primary"
          size="md" // Changed to md for better height alignment
          loading={sending}
          onClick={handleSendComment}
          disabled={!newComment.trim() || sending} // ensure sending also disables button
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default CommentBoard; 