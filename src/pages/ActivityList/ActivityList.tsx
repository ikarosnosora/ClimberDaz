import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useActivitySelector,
  useActivityActions,
  useFilterSelector,
  useFilterActions,
} from '../../store/useOptimizedStore';
import { Activity, ActivityType } from '../../types';
import { 
  ActivityCard, 
  PullToRefresh, 
  InfiniteScroll, 
  RealTimeSearch 
} from '../../components';
import { showSuccess, showError } from '../../utils/notifications';
import './ActivityList.css';

// Constants for pagination and virtual scrolling
const ITEMS_PER_PAGE = 10;

// Memoized ActivityCard for better performance
const MemoizedActivityCard = React.memo<{
  activity: Activity;
  index: number;
  onActivityClick: (activity: Activity) => void;
}>(({ activity, index, onActivityClick }) => {
  const handleClick = useCallback(() => {
    onActivityClick(activity);
  }, [activity, onActivityClick]);

  return (
    <div 
      className="activity-item mb-4"
      style={{ 
        animation: `fadeInUp 0.4s ease-out ${Math.min(index * 0.1, 1)}s both`,
      }}
    >
      <ActivityCard
        activity={activity}
        onClick={handleClick}
        showDistance={true}
      />
    </div>
  );
});

MemoizedActivityCard.displayName = 'MemoizedActivityCard';

// Memoized filter buttons component
const FilterSummary = React.memo<{
  selectedTypes: string[];
  selectedGrades: string[];
  onClearFilters: () => void;
}>(({ selectedTypes, selectedGrades, onClearFilters }) => {
  const hasFilters = selectedTypes.length > 0 || selectedGrades.length > 0;
  
  if (!hasFilters) return null;

  return (
    <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-blue-700">
          <span>已应用筛选: </span>
          {selectedTypes.length > 0 && (
            <span className="font-medium">{selectedTypes.length} 种类型</span>
          )}
          {selectedTypes.length > 0 && selectedGrades.length > 0 && <span>, </span>}
          {selectedGrades.length > 0 && (
            <span className="font-medium">{selectedGrades.length} 种难度</span>
          )}
        </div>
        <button
          onClick={onClearFilters}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
        >
          清除筛选
        </button>
      </div>
    </div>
  );
});

FilterSummary.displayName = 'FilterSummary';

const ActivityList: React.FC = () => {
  const navigate = useNavigate();

  // Store hooks with memoized selectors
  const {
    activities: allActivities, 
    isLoadingActivities: storeLoading,
  } = useActivitySelector();
  
  const { 
    fetchActivities,
    refreshActivities,
  } = useActivityActions();
  
  const {
    selectedTypes: activityListSelectedTypes,
    selectedGrades: activityListSelectedGrades,
  } = useFilterSelector();
  
  const {
    setSelectedTypes: setActivityListSelectedTypes,
    setSelectedGrades: setActivityListSelectedGrades,
    resetFilters: resetStoreFilters,
  } = useFilterActions();

  // Debug logging - memoized to prevent excessive calls
  const debugInfo = useMemo(() => ({
    activitiesCount: allActivities.length,
    isLoading: storeLoading,
  }), [allActivities.length, storeLoading]);

  // Fetch activities on component mount
  useEffect(() => {
    console.log('[ActivityList Debug] Component mounted');
    console.log('[ActivityList Debug] debugInfo:', debugInfo);
    
    // Only fetch if we don't have activities loaded yet
    if (allActivities.length === 0 && !storeLoading) {
      console.log('[ActivityList] Fetching activities from API...');
      fetchActivities().catch((error) => {
        console.error('[ActivityList] Failed to fetch activities:', error);
        showError('获取活动列表失败，请检查网络连接');
      });
    }
  }, [debugInfo, allActivities.length, storeLoading, fetchActivities]);

  // Local state
  const [displayedActivitiesCount, setDisplayedActivitiesCount] = useState(ITEMS_PER_PAGE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [realTimeSearchResults, setRealTimeSearchResults] = useState<Activity[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Memoized navigation handlers
  const handleActivityClick = useCallback((selectedActivity: Activity) => {
    navigate(`/activity/${selectedActivity.id}`);
  }, [navigate]);

  const handleRealTimeActivityClick = useCallback((activity: Activity) => {
    navigate(`/activity/${activity.id}`);
  }, [navigate]);

  const navigateToCreate = useCallback(() => {
    navigate('/create-activity');
  }, [navigate]);

  // Debounced search result handler
  const debouncedSearchHandler = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (results: Activity[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setRealTimeSearchResults(results);
        setShowSearchResults(results.length > 0);
      }, 150);
    };
  }, []);

  const handleRealTimeSearchResults = useCallback((results: Activity[]) => {
    debouncedSearchHandler(results);
  }, [debouncedSearchHandler]);

  // Memoized filtering and sorting logic
  const filteredAndSortedActivities = useMemo(() => {
    const startTime = performance.now();
    
    let filtered = showSearchResults ? realTimeSearchResults : allActivities;

    // Apply type filters
    if (activityListSelectedTypes.length > 0) {
      filtered = filtered.filter(activity =>
        activity.types.some(type => activityListSelectedTypes.includes(type as string))
      );
    }

    // Apply grade filters
    if (activityListSelectedGrades.length > 0) {
      filtered = filtered.filter(activity =>
        activity.grades.some(grade => activityListSelectedGrades.includes(grade))
      );
    }

    // Sort by datetime (earliest first) - optimized sorting
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.datetime).getTime();
      const dateB = new Date(b.datetime).getTime();
      return dateA - dateB;
    });

    const endTime = performance.now();
    if (endTime - startTime > 10) {
      console.log(`[ActivityList Performance] Filtering took ${(endTime - startTime).toFixed(2)}ms`);
    }

    return sorted;
  }, [allActivities, realTimeSearchResults, showSearchResults, activityListSelectedTypes, activityListSelectedGrades]);

  // Memoized pagination logic
  const paginationData = useMemo(() => {
    const currentActivities = filteredAndSortedActivities.slice(0, displayedActivitiesCount);
    const hasMore = displayedActivitiesCount < filteredAndSortedActivities.length;
    
    return {
      currentActivities,
      hasMore,
      totalCount: filteredAndSortedActivities.length,
    };
  }, [filteredAndSortedActivities, displayedActivitiesCount]);

  // Optimized load more function
  const loadMoreActivities = useCallback(async () => {
    if (isLoadingMore || !paginationData.hasMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate network delay with shorter timeout for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setDisplayedActivitiesCount(prev => Math.min(
      prev + ITEMS_PER_PAGE,
      filteredAndSortedActivities.length
    ));
    
    setIsLoadingMore(false);
  }, [isLoadingMore, paginationData.hasMore, filteredAndSortedActivities.length]);

  // Enhanced refresh functionality with real API call
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log('[ActivityList] Refreshing activities from API...');
      await refreshActivities();
      setDisplayedActivitiesCount(ITEMS_PER_PAGE);
      setShowSearchResults(false);
      setRealTimeSearchResults([]);
      showSuccess('活动列表已更新！');
    } catch (error) {
      console.error('Refresh failed:', error);
      showError('刷新失败，请重试');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshActivities]);

  // Memoized filter management
  const currentFilters = useMemo(() => ({
    types: activityListSelectedTypes as ActivityType[],
    grades: activityListSelectedGrades,
  }), [activityListSelectedTypes, activityListSelectedGrades]);

  const handleFiltersChange = useCallback((newFilters: { types: ActivityType[]; grades: string[] }) => {
    setActivityListSelectedTypes(newFilters.types as string[]);
    setActivityListSelectedGrades(newFilters.grades);
    // Reset pagination when filters change
    setDisplayedActivitiesCount(ITEMS_PER_PAGE);
  }, [setActivityListSelectedTypes, setActivityListSelectedGrades]);

  const handleClearFilters = useCallback(() => {
    resetStoreFilters();
    setDisplayedActivitiesCount(ITEMS_PER_PAGE);
  }, [resetStoreFilters]);

  // Memoized filter state
  const isFiltersApplied = useMemo(() => 
    activityListSelectedTypes.length > 0 || activityListSelectedGrades.length > 0,
    [activityListSelectedTypes.length, activityListSelectedGrades.length]
  );

  // Render activity list with virtual scrolling for large lists
  const renderActivityList = useMemo(() => {
    if (paginationData.currentActivities.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🧗‍♀️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isFiltersApplied ? '没有符合条件的活动' : '暂无活动'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isFiltersApplied ? '尝试调整筛选条件或清除筛选' : '成为第一个创建活动的人！'}
          </p>
          {!isFiltersApplied && (
            <button
              onClick={navigateToCreate}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              创建活动
            </button>
          )}
        </div>
      );
    }

    return (
      <InfiniteScroll
        hasMore={paginationData.hasMore}
        loadMore={loadMoreActivities}
        loading={isLoadingMore}
      >
        <div className="space-y-4">
          {paginationData.currentActivities.map((activity, index) => (
            <MemoizedActivityCard
              key={activity.id}
              activity={activity}
              index={index}
              onActivityClick={handleActivityClick}
            />
          ))}
        </div>
      </InfiniteScroll>
    );
  }, [
    paginationData.currentActivities,
    paginationData.hasMore,
    isFiltersApplied,
    isLoadingMore,
    loadMoreActivities,
    handleActivityClick,
    navigateToCreate
  ]);

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      <div 
        className="min-h-screen p-6 pb-20"
        style={{
          background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
        }}
      >
        {/* Enhanced Search and Filter Bar */}
        <div className="mb-3">
          <RealTimeSearch
            activities={allActivities}
            onSearchResults={handleRealTimeSearchResults}
            onActivityClick={handleRealTimeActivityClick}
            filters={currentFilters}
            onFiltersChange={handleFiltersChange}
            placeholder="🔍 实时搜索活动名称或地点..."
            debounceMs={300}
            maxResults={15}
          />
        </div>

        {/* Filter Summary */}
        <FilterSummary
          selectedTypes={activityListSelectedTypes}
          selectedGrades={activityListSelectedGrades}
          onClearFilters={handleClearFilters}
        />

        {/* Activity List */}
        {renderActivityList}

        {/* Loading indicator */}
        {storeLoading && !isRefreshing && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-gray-700">加载中...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default React.memo(ActivityList);