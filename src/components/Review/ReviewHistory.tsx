import React, { useState, useEffect } from 'react';
import { default as UserAvatar } from '../UserAvatar/UserAvatar';
import dayjs from 'dayjs';

export interface ReviewData {
  id: string;
  rating: 'GOOD' | 'BAD' | 'GHOST' | 'SKIP';
  comment?: string;
  activityId: string;
  reviewerId: string;
  revieweeId: string;
  chainId: string;
  isSubmitted: boolean;
  submitDeadline: Date;
  createdAt: Date;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  reviewee: {
    id: string;
    name: string;
    avatar?: string;
  };
  activity: {
    id: string;
    title: string;
    date: Date;
  };
}

export interface ReviewChainData {
  id: string;
  activityId: string;
  userSequence: string[];
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  triggerTime: Date;
  expireTime: Date;
  completedCount: number;
  totalCount: number;
  createdAt: Date;
}

export interface ReviewStats {
  totalReceived: number;
  totalGiven: number;
  goodCount: number;
  badCount: number;
  ghostCount: number;
  skipCount: number;
  reputationScore: number;
  completionRate: number;
}

interface ReviewHistoryProps {
  userId: string;
  viewType?: 'received' | 'given' | 'both';
  showStats?: boolean;
  compact?: boolean;
}

const ReviewHistory: React.FC<ReviewHistoryProps> = ({
  userId,
  viewType = 'both',
  showStats = true,
  compact = false
}) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [chains, setChains] = useState<ReviewChainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  useEffect(() => {
    loadReviewData();
  }, [userId, viewType]);

  const loadReviewData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      await Promise.all([
        loadReviews(),
        showStats && loadStats(),
        loadChains()
      ]);
    } catch (error) {
      console.error('Failed to load review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    // Mock data - replace with actual API call
    const mockReviews: ReviewData[] = [
      {
        id: '1',
        rating: 'GOOD',
        comment: '很棒的攀岩伙伴，技术扎实，安全意识强',
        activityId: 'activity1',
        reviewerId: 'user2',
        revieweeId: userId,
        chainId: 'chain1',
        isSubmitted: true,
        submitDeadline: new Date(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        reviewer: {
          id: 'user2',
          name: 'Alice',
          avatar: '/images/avatar2.jpg'
        },
        reviewee: {
          id: userId,
          name: '我',
          avatar: '/images/avatar1.jpg'
        },
        activity: {
          id: 'activity1',
          title: '周末欢乐抱石局',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      }
    ];
    setReviews(mockReviews);
  };

  const loadStats = async () => {
    // Mock stats - replace with actual API call
    const mockStats: ReviewStats = {
      totalReceived: 15,
      totalGiven: 12,
      goodCount: 12,
      badCount: 2,
      ghostCount: 1,
      skipCount: 3,
      reputationScore: 4.2,
      completionRate: 85
    };
    setStats(mockStats);
  };

  const loadChains = async () => {
    // Mock chains - replace with actual API call
    const mockChains: ReviewChainData[] = [];
    setChains(mockChains);
  };

  const getRatingIcon = (rating: ReviewData['rating']) => {
    const configs = {
      GOOD: { icon: '👍', color: 'text-green-600', bg: 'bg-green-100' },
      BAD: { icon: '👎', color: 'text-red-600', bg: 'bg-red-100' },
      GHOST: { icon: '🕊️', color: 'text-gray-600', bg: 'bg-gray-100' },
      SKIP: { icon: '⏭️', color: 'text-blue-600', bg: 'bg-blue-100' }
    };
    return configs[rating];
  };

  const getStatusColor = (status: ReviewChainData['status']) => {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      ACTIVE: 'text-blue-600 bg-blue-100',
      COMPLETED: 'text-green-600 bg-green-100',
      EXPIRED: 'text-gray-600 bg-gray-100'
    };
    return colors[status];
  };

  const getStatusText = (status: ReviewChainData['status']) => {
    const texts = {
      PENDING: '等待开始',
      ACTIVE: '进行中',
      COMPLETED: '已完成',
      EXPIRED: '已过期'
    };
    return texts[status];
  };

  const filteredReviews = reviews.filter(review => {
    if (viewType === 'both') {
      return activeTab === 'received' 
        ? review.revieweeId === userId 
        : review.reviewerId === userId;
    }
    return viewType === 'received' 
      ? review.revieweeId === userId 
      : review.reviewerId === userId;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      {showStats && stats && !compact && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">评价统计</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.reputationScore}</div>
              <div className="text-sm text-gray-600">信誉分数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">完成率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalReceived}</div>
              <div className="text-sm text-gray-600">收到评价</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalGiven}</div>
              <div className="text-sm text-gray-600">给出评价</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg">👍</div>
              <div className="text-sm font-medium text-green-700">{stats.goodCount}</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg">👎</div>
              <div className="text-sm font-medium text-red-700">{stats.badCount}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg">🕊️</div>
              <div className="text-sm font-medium text-gray-700">{stats.ghostCount}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg">⏭️</div>
              <div className="text-sm font-medium text-blue-700">{stats.skipCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Selection */}
      {viewType === 'both' && !compact && (
        <div className="bg-white rounded-2xl shadow-sm p-2">
          <div className="flex">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === 'received'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              收到的评价
            </button>
            <button
              onClick={() => setActiveTab('given')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 ${
                activeTab === 'given'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              给出的评价
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价记录</h3>
            <p className="text-gray-600">
              {activeTab === 'received' ? '还没有收到任何评价' : '还没有给出任何评价'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const ratingConfig = getRatingIcon(review.rating);
            const isReceived = activeTab === 'received' || viewType === 'received';
            const displayUser = isReceived ? review.reviewer : review.reviewee;

            return (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <UserAvatar 
                                        avatar={displayUser.avatar}
                    nickname={displayUser.name}
                    size={compact ? "md" : "lg"} 
                  />

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{displayUser.name}</h4>
                        <p className="text-sm text-gray-600">{review.activity.title}</p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full ${ratingConfig.bg}`}>
                        <span className="text-lg mr-1">{ratingConfig.icon}</span>
                        <span className={`text-sm font-medium ${ratingConfig.color}`}>
                          {review.rating === 'GOOD' && '好评'}
                          {review.rating === 'BAD' && '差评'}
                          {review.rating === 'GHOST' && '鸽子'}
                          {review.rating === 'SKIP' && '跳过'}
                        </span>
                      </div>
                    </div>

                    {review.comment && (
                      <div className="mb-3">
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                          "{review.comment}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{dayjs(review.createdAt).fromNow()}</span>
                      <span>{dayjs(review.activity.date).format('YYYY年MM月DD日')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Chains Status (if any) */}
      {chains.length > 0 && !compact && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">评价链状态</h3>
          <div className="space-y-3">
            {chains.map((chain) => (
              <div key={chain.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">活动评价链</div>
                  <div className="text-sm text-gray-600">
                    {chain.completedCount}/{chain.totalCount} 已完成
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(chain.status)}`}>
                    {getStatusText(chain.status)}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {dayjs(chain.expireTime).format('MM月DD日 HH:mm')} 截止
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewHistory; 