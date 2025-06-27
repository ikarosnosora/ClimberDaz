import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { AnalyticsStats, DashboardData, RealTimeMetrics, SystemAlert } from '../../types/analytics';
import { apiRequest } from '../../utils/api';
import { colors } from '../../utils/designSystem';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import OptimizedChart from '../../components/OptimizedChart/OptimizedChart';
import useLazyData from '../../hooks/useLazyData';

// SVG Icons (re-use or define new ones)
const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ListIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ActivityIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const ServerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3" />
  </svg>
);

const EyeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.639 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.639 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const WifiIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
  </svg>
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isRealTime?: boolean;
}



const StatCard: React.FC<StatCardProps> = memo(({ title, value, icon, trend, isRealTime }) => (
  <div className="bg-slate-50 p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center h-full relative">
    {isRealTime && (
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    )}
    <div className="flex items-center text-gray-600 mb-2">
      {icon}
      <span className="ml-2 text-sm font-medium whitespace-nowrap">{title}</span>
    </div>
    <p className="text-2xl font-semibold text-gray-800">{value}</p>
    {trend && (
      <div className={`flex items-center mt-1 text-xs ${
        trend.isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        <span className={`mr-1 ${trend.isPositive ? '↗' : '↘'}`}>
          {trend.isPositive ? '↗' : '↘'}
        </span>
        {Math.abs(trend.value)}%
      </div>
    )}
  </div>
));

StatCard.displayName = 'StatCard';


const AdminStats: React.FC = memo(() => {
  const { allUsers, activities } = useStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Use lazy data loading for analytics events
  const {
    data: analyticsEvents,
    loading: eventsLoading,
    loadMore: loadMoreEvents,
    hasMore: hasMoreEvents,
  } = useLazyData('/analytics/events', {
    pageSize: 50,
    enabled: true,
  });

  // Memoized calculations for better performance
  const memoizedStats = useMemo(() => {
    const totalUsers = allUsers.length;
    const totalActivities = activities.length;
    const newUsersToday = allUsers.filter(user => {
      const today = new Date();
      const userDate = new Date(user.createdAt || user.joinDate);
      return userDate.toDateString() === today.toDateString();
    }).length;
    
    const activeActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= new Date();
    }).length;

    return {
      totalUsers,
      totalActivities,
      newUsersToday,
      activeActivities,
    };
  }, [allUsers, activities]);

  // Memoized chart data processing
  const chartData = useMemo(() => {
    if (!dashboardData) return null;

    return {
      weeklyEvents: dashboardData.weeklyStats?.map(stat => ({
        ...stat,
        date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })) || [],
      eventTypes: dashboardData.userBehavior?.eventTypeDistribution || [],
      popularPages: dashboardData.userBehavior?.popularPages?.slice(0, 5) || [],
      userActivity: dashboardData.userBehavior?.topActiveUsers?.slice(0, 5) || [],
    };
  }, [dashboardData]);

  // 获取实时指标数据
  const fetchRealTimeMetrics = useCallback(async () => {
    try {
      const response = await apiRequest.get('/analytics/real-time-metrics');
      setRealTimeMetrics(response.data);
    } catch (err) {
      console.error('Failed to fetch real-time metrics:', err);
    }
  }, []);

  // 获取系统告警
  const fetchSystemAlerts = useCallback(async () => {
    try {
      const response = await apiRequest.get('/analytics/system-alerts');
      setSystemAlerts(response.data);
    } catch (err) {
      console.error('Failed to fetch system alerts:', err);
    }
  }, []);

  // 获取分析数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiRequest.get('/analytics/dashboard');
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchRealTimeMetrics();
    fetchSystemAlerts();
    
    // 每5分钟刷新一次数据
    const dashboardInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    // 实时数据每30秒刷新一次
    const realTimeInterval = isRealTimeEnabled ? setInterval(() => {
      fetchRealTimeMetrics();
      fetchSystemAlerts();
    }, 30 * 1000) : null;
    
    return () => {
      clearInterval(dashboardInterval);
      if (realTimeInterval) clearInterval(realTimeInterval);
    };
  }, [isRealTimeEnabled, fetchRealTimeMetrics, fetchSystemAlerts]);

  // Use memoized stats instead of recalculating
  const { totalUsers, totalActivities, newUsersToday, activeActivities } = memoizedStats;

  // 图表颜色配置
  const chartColors = [colors.primary[500], colors.secondary[500], colors.accent[500], colors.neutral[400]];

  // 系统告警组件
  const SystemAlertsPanel = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-gray-800">系统告警</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">实时监控</span>
          <button
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isRealTimeEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isRealTimeEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {systemAlerts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <WifiIcon className="mx-auto mb-2" />
            <p className="text-sm">系统运行正常</p>
          </div>
        ) : (
          systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-500'
                  : alert.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                <span className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">系统统计</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">系统统计</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">系统统计</h2>
        <div className="text-sm text-gray-500">
          最后更新: {dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleString() : '未知'}
        </div>
      </div>
      
      {/* 实时系统指标 */}
      {realTimeMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="在线用户" 
            value={realTimeMetrics.onlineUsers} 
            icon={<EyeIcon />} 
            isRealTime={true}
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatCard 
            title="活跃连接" 
            value={realTimeMetrics.activeConnections} 
            icon={<WifiIcon />} 
            isRealTime={true}
          />
          <StatCard 
            title="响应时间" 
            value={`${realTimeMetrics.responseTime}ms`} 
            icon={<ClockIcon />} 
            isRealTime={true}
            trend={{ value: 2.1, isPositive: false }}
          />
          <StatCard 
            title="服务器负载" 
            value={`${realTimeMetrics.serverLoad}%`} 
            icon={<ServerIcon />} 
            isRealTime={true}
          />
        </div>
      )}

      {/* 基础统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="总用户数" 
          value={totalUsers} 
          icon={<UserIcon />} 
        />
        <StatCard 
          title="今日新用户" 
          value={newUsersToday} 
          icon={<UserIcon />} 
        />
        <StatCard 
          title="活跃活动" 
          value={activeActivities} 
          icon={<ListIcon />} 
        />
        <StatCard 
          title="总活动数" 
          value={totalActivities} 
          icon={<ListIcon />} 
        />
      </div>

      {/* 分析数据统计 */}
      {dashboardData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="周总事件" 
              value={dashboardData.weeklyStats.summary.totalEvents} 
              icon={<ClockIcon />} 
            />
            <StatCard 
              title="周活跃用户" 
              value={dashboardData.weeklyStats.summary.uniqueUsers} 
              icon={<UserIcon />} 
            />
            <StatCard 
              title="周会话数" 
              value={dashboardData.weeklyStats.summary.uniqueSessions} 
              icon={<ClockIcon />} 
            />
            <StatCard 
              title="今日事件" 
              value={dashboardData.todayStats.summary.totalEvents} 
              icon={<ClockIcon />} 
            />
          </div>

          {/* 系统告警面板 */}
          <SystemAlertsPanel />

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 实时性能监控 */}
            {realTimeMetrics && (
              <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                <h3 className="text-md font-semibold text-gray-800 mb-4">实时系统性能</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{realTimeMetrics.cpuUsage}%</div>
                    <div className="text-sm text-gray-500">CPU 使用率</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${realTimeMetrics.cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{realTimeMetrics.memoryUsage}%</div>
                    <div className="text-sm text-gray-500">内存使用率</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${realTimeMetrics.memoryUsage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{realTimeMetrics.errorRate}%</div>
                    <div className="text-sm text-gray-500">错误率</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${realTimeMetrics.errorRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* 时间序列图表 - 优化版本 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-md font-semibold text-gray-800 mb-4">7天事件趋势</h3>
              <OptimizedChart
                type="line"
                data={chartData?.weeklyEvents || []}
                height={250}
                loading={loading}
                config={{
                  children: [
                    <CartesianGrid key="grid" strokeDasharray="3 3" />,
                    <XAxis key="xaxis" dataKey="date" />,
                    <YAxis key="yaxis" />,
                    <Tooltip key="tooltip" />,
                    <Line 
                      key="line"
                      type="monotone" 
                      dataKey="count" 
                      stroke={colors.primary[500]} 
                      strokeWidth={2}
                      dot={{ fill: colors.primary[500] }}
                    />
                  ]
                }}
              />
            </div>

            {/* 事件类型分布 - 优化版本 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-md font-semibold text-gray-800 mb-4">事件类型分布</h3>
              <OptimizedChart
                type="bar"
                data={chartData?.eventTypes || []}
                height={250}
                loading={loading}
                config={{
                  children: [
                    <CartesianGrid key="grid" strokeDasharray="3 3" />,
                    <XAxis key="xaxis" dataKey="eventType" angle={-45} textAnchor="end" height={80} />,
                    <YAxis key="yaxis" />,
                    <Tooltip key="tooltip" />,
                    <Bar key="bar" dataKey="count" fill={colors.secondary[500]} />
                  ]
                }}
              />
            </div>

            {/* 页面访问排行 - 优化版本 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-md font-semibold text-gray-800 mb-4">热门页面</h3>
              <div className="space-y-3">
                {chartData?.popularPages.slice(0, 5).map((page, index) => (
                  <div key={page.pagePath} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 truncate">{page.pagePath || '/'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{page.visits}</div>
                      <div className="text-xs text-gray-500">{page.uniqueVisitors} 独立访客</div>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>

            {/* 用户活跃度 - 优化版本 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-md font-semibold text-gray-800 mb-4">用户活跃度</h3>
              <div className="space-y-3">
                {chartData?.userActivity.slice(0, 5).map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">用户 {user.userId.slice(-8)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{user.eventCount} 事件</div>
                      <div className="text-xs text-gray-500">{user.activeDays} 活跃天数</div>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminStats;