import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivityCard, AnnouncementBanner } from '../../components';
import { useActivitySelector, useActivityActions, useFilterSelector, useFilterActions, useAppSelector, useAppActions } from '../../store/useOptimizedStore';
import { showSuccess, showInfo } from '../../utils/notifications';
import type { Activity } from '../../types';
import {
  MeetMode,
  CostMode,
  ActivityStatus,
  ActivityType,
  DifficultyGrade,
} from '../../types';
import './ActivityList.css';
import {
  V_SCALE_GRADES,
  YDS_GRADES,
  activityTypeDetails,
} from '../../constants/climbingData';
import { getDistanceFromLatLonInKm } from '../../utils/geo';
import { colors, shadows } from '../../utils/designSystem';

// Enhanced Icon Components with better styling
const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className="w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors duration-200"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const XMarkIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className="w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FilterIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);

// Enhanced Empty state component with gradients
const CustomEmpty: React.FC<{ description: string; imageStyle?: React.CSSProperties; className?: string }> = ({ description, imageStyle, className }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 ${className || ''}`}>
      <div 
        className="text-6xl mb-6 p-4 rounded-full"
        style={{ 
          background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[50]} 100%)`,
          ...imageStyle 
        }}
      >
        🧗‍♀️
      </div>
      <p className="text-neutral-600 font-medium text-lg">{description}</p>
    </div>
  );
};

// Re-create activityTypeOptions from activityTypeDetails if it was indeed used and removed
const activityTypeOptions = (Object.keys(activityTypeDetails) as ActivityType[]).map(typeKey => ({
    label: activityTypeDetails[typeKey].label,
    value: typeKey,
}));

// Mock data (remains the same for now)
const mockActivities: Omit<Activity, 'gears'>[] = [
  {
    id: '1',
    hostId: 'user1',
    title: '周末一起攀岩吧！V4-V6 level',
    datetime: new Date('2025-06-01T14:00:00'),
    locationText: '岩时攀岩馆（望京店）',
    lat: 39.9884,
    lng: 116.4716,
    meetMode: MeetMode.MEET_AT_ENTRANCE,
    isPrivate: false,
    types: [ActivityType.BOULDERING],
    grades: [DifficultyGrade.V3_V5, DifficultyGrade.V6_V7],
    costMode: CostMode.AA,
    slotMax: 4,
    status: ActivityStatus.OPEN,
    createdAt: new Date(),
    participantCount: 2,
    host: { openid: 'user1', nickname: 'RockClimber', gearTags: [], createdAt: new Date() },
  },
  {
    id: '2',
    hostId: 'user2',
    title: '新手友好局，一起学习抱石',
    datetime: new Date('2025-06-02T10:00:00'),
    locationText: 'MWA攀岩馆',
    lat: 39.9304,
    lng: 116.4316,
    meetMode: MeetMode.FIRST_COME_FIRST_CLIMB,
    isPrivate: false,
    types: [ActivityType.BOULDERING, ActivityType.TRAINING],
    grades: [DifficultyGrade.V0_V2],
    costMode: CostMode.FREE,
    slotMax: 6,
    status: ActivityStatus.OPEN,
    createdAt: new Date(),
    participantCount: 3,
    host: { openid: 'user2', nickname: 'NewbieClimber', gearTags: [], createdAt: new Date() },
  },
];

const mockAnnouncements = [
  {
    id: '1',
    title: '🎉 ClimberDaz 正式上线！欢迎各位岩友',
    content: '详细内容...',
    startAt: new Date(),
    endAt: new Date('2025-12-31'),
    weight: 1,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: '📢 本周六有官方组织的新手教学活动',
    content: '详细内容...',
    startAt: new Date(),
    endAt: new Date('2025-06-30'),
    weight: 2,
    createdAt: new Date(),
  },
];

const ITEMS_PER_PAGE = 10; // For manual infinite scroll / load more

const ActivityList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activities: allActivities, 
    isLoadingActivities: storeLoading,
  } = useActivitySelector();
  
  const { 
    announcements,
  } = useAppSelector();
  
  const {
    searchText: activityListSearchText,
    selectedTypes: activityListSelectedTypes,
    selectedGrades: activityListSelectedGrades,
  } = useFilterSelector();
  
  const { 
    setActivities, 
    setActivityLoading: setStoreLoading,
  } = useActivityActions();
  
  const {
    setAnnouncements,
  } = useAppActions();
  
  const {
    setSearchText: setActivityListSearchText,
    setSelectedTypes: setActivityListSelectedTypes,
    setSelectedGrades: setActivityListSelectedGrades,
  } = useFilterActions();

  const [displayedActivitiesCount, setDisplayedActivitiesCount] = useState(ITEMS_PER_PAGE);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [tempSelectedActivityTypes, setTempSelectedActivityTypes] = useState<ActivityType[]>(activityListSelectedTypes as ActivityType[]);
  const [tempSelectedDifficultyGrades, setTempSelectedDifficultyGrades] = useState<string[]>(activityListSelectedGrades);
  const [currentGradeOptionsInPopup, setCurrentGradeOptionsInPopup] = useState<Array<{label: string, value: string}>>([]);

  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchText, setSearchText] = useState(activityListSearchText);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>(activityListSelectedTypes);
  const [selectedDifficultyGrades, setSelectedDifficultyGrades] = useState<string[]>(activityListSelectedGrades);

  // Effect to sync local state with Zustand store values (e.g., on initial load or if store changes externally)
  useEffect(() => {
    setSearchText(activityListSearchText);
    setSelectedActivityTypes(activityListSelectedTypes); // These are the applied filters
    setSelectedDifficultyGrades(activityListSelectedGrades);
    // Initialize temp filters in popup with applied/store values
    setTempSelectedActivityTypes(activityListSelectedTypes as ActivityType[]);
    setTempSelectedDifficultyGrades(activityListSelectedGrades);
  }, [activityListSearchText, activityListSelectedTypes, activityListSelectedGrades]);

  // Effect to update available grade options in the filter popup based on tempSelectedActivityTypes
  useEffect(() => {
    const newGradeOptions: Array<{label: string, value: string}> = [];
    let hasVScale = false;
    let hasYDS = false;
    tempSelectedActivityTypes.forEach(type => {
      const details = activityTypeDetails[type as ActivityType];
      if (details) {
        if (details.gradeSystem === 'VScale') hasVScale = true;
        if (details.gradeSystem === 'YDS') hasYDS = true;
        if (details.gradeSystem === 'Both') { hasVScale = true; hasYDS = true; }
      }
    });
    if (hasVScale) V_SCALE_GRADES.forEach(g => !newGradeOptions.find(opt => opt.value === g.value) && newGradeOptions.push(g));
    if (hasYDS) YDS_GRADES.forEach(g => !newGradeOptions.find(opt => opt.value === g.value) && newGradeOptions.push(g));
    const sortedOptions = newGradeOptions.sort((a,b) => a.label.localeCompare(b.label));
    setCurrentGradeOptionsInPopup(sortedOptions);
    const validSelectedGrades = tempSelectedDifficultyGrades.filter((g: string) => sortedOptions.some(opt => opt.value === g));
    if (JSON.stringify(tempSelectedDifficultyGrades) !== JSON.stringify(validSelectedGrades)) {
        setTempSelectedDifficultyGrades(validSelectedGrades);
    }
  }, [tempSelectedActivityTypes, tempSelectedDifficultyGrades]);

  const initializeData = useCallback(async (isRefresh = false) => {
    if(!isRefresh) setStoreLoading(true);
    setIsFetchingLocation(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setActivities(mockActivities as Activity[]); 
    setAnnouncements(mockAnnouncements);
    if(!isRefresh) {
        setTempSelectedActivityTypes(activityListSelectedTypes as ActivityType[]);
        setTempSelectedDifficultyGrades(activityListSelectedGrades);
    }
    if(!isRefresh) setStoreLoading(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsFetchingLocation(false);
          if(isRefresh) showSuccess('已刷新并更新位置');
          else showSuccess('已获取当前位置用于计算距离');
        },
        (error) => {
          console.warn('Error getting geolocation:', error.message);
          setIsFetchingLocation(false);
          showInfo('无法获取位置, 距离功能可能不可用');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsFetchingLocation(false);
      console.warn('Geolocation is not supported by this browser.');
    }
  }, [setActivities, setAnnouncements, activityListSelectedTypes, activityListSelectedGrades, setStoreLoading]);

  useEffect(() => {
    initializeData();
  }, [initializeData]); // Ensure initializeData is stable with useCallback

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await initializeData(true); // Pass true for isRefresh
    setDisplayedActivitiesCount(ITEMS_PER_PAGE);
    setIsRefreshing(false);
    // Toast is shown within initializeData for refresh completion
  };

  const loadMoreActivities = () => {
    if (storeLoading || isLoadingMore || isRefreshing) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedActivitiesCount(prevCount => prevCount + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 700);
  };

  const handleActivityClick = (activity: Activity) => {
    navigate(`/activity/${activity.id}`);
  };

  const handleAnnouncementClick = (announcement: { id: string; title: string; content: string }) => {
    showInfo(`查看公告: ${announcement.title}`);
  };

  const handleSearchValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setActivityListSearchText(searchText); 
    setDisplayedActivitiesCount(ITEMS_PER_PAGE); 
  };
  
  const handleClearSearch = () => {
    setSearchText('');
    setActivityListSearchText('');
    setDisplayedActivitiesCount(ITEMS_PER_PAGE);
  };

  const filteredAndSortedActivities = useMemo(() => {
    let processed = allActivities.map(activity => {
      let distanceKm: number | undefined = undefined;
      if (currentUserLocation && typeof activity.lat === 'number' && typeof activity.lng === 'number') {
        distanceKm = getDistanceFromLatLonInKm(currentUserLocation.lat, currentUserLocation.lng, activity.lat, activity.lng);
      }
      return { ...activity, distanceKm };
    });

    const effectiveSearchText = searchText.toLowerCase(); // Use committed search text for filtering
    if (effectiveSearchText) {
      processed = processed.filter(activity => 
        activity.title.toLowerCase().includes(effectiveSearchText) ||
        activity.locationText.toLowerCase().includes(effectiveSearchText)
      );
    }
    if (selectedActivityTypes.length > 0) {
      processed = processed.filter(activity => 
        selectedActivityTypes.every(type => activity.types.includes(type as ActivityType))
      );
    }
    if (selectedDifficultyGrades.length > 0) {
      processed = processed.filter(activity => 
        activity.grades?.some(grade => selectedDifficultyGrades.includes(grade as string))
      );
    }
    processed.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    return processed;
  }, [allActivities, currentUserLocation, searchText, selectedActivityTypes, selectedDifficultyGrades]);
  
  const currentActivitiesToDisplay = filteredAndSortedActivities.slice(0, displayedActivitiesCount);
  const hasMoreToLoad = displayedActivitiesCount < filteredAndSortedActivities.length;

  const isFiltersApplied = selectedActivityTypes.length > 0 || selectedDifficultyGrades.length > 0;

  const handleApplyFilters = () => {
    setActivityListSelectedTypes(tempSelectedActivityTypes);
    setActivityListSelectedGrades(tempSelectedDifficultyGrades);
    setDisplayedActivitiesCount(ITEMS_PER_PAGE);
    setShowFilterPopup(false);
    showSuccess('筛选已应用');
  };

  const handleResetFiltersInPopup = () => {
    setTempSelectedActivityTypes([]);
    setTempSelectedDifficultyGrades([]);
    // Optionally, could also reset the main applied filters here and refetch/re-filter
    // For now, only resets temp state in popup.
  };

  const openFilterPopup = () => {
    // Sync temp filters with current applied filters before opening
    setTempSelectedActivityTypes(activityListSelectedTypes as ActivityType[]);
    setTempSelectedDifficultyGrades(activityListSelectedGrades);
    setShowFilterPopup(true);
  };

  const navigateToCreate = () => {
    navigate('/create-activity');
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.neutral[50]} 30%, ${colors.secondary[50]} 100%)`,
      }}
    >
      {/* Enhanced Page Header with gradient */}
      <div 
        className="sticky top-0 z-20 px-6 py-5 backdrop-blur-lg border-b"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)`,
          borderColor: `${colors.neutral[200]}80`,
          boxShadow: `${shadows.medium}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
        }}
      >
        <h1 
          className="text-3xl font-bold text-center mb-4 bg-gradient-to-r bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
          }}
        >
          🧗 探索攀岩活动
        </h1>
        
        {/* Enhanced Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 mb-4">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="search"
              placeholder="🔍 搜索活动标题或地点"
              value={searchText}
              onChange={handleSearchValueChange}
              className="block w-full pl-12 pr-12 py-4 text-sm font-medium rounded-2xl border-2 leading-5 placeholder-neutral-500 transition-all duration-300 ease-smooth focus:outline-none focus:ring-4 focus:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                borderColor: colors.neutral[200],
                backdropFilter: 'blur(10px)',
                boxShadow: `${shadows.soft}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary[400];
                e.target.style.boxShadow = `0 0 0 4px ${colors.primary[500]}20, ${shadows.medium}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.neutral[200];
                e.target.style.boxShadow = `${shadows.soft}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`;
              }}
            />
            {searchText && (
              <button 
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                aria-label="Clear search"
              >
                <XMarkIcon />
              </button>
            )}
          </div>
          
          {/* Enhanced Filter Button */}
          <button 
            type="button" 
            onClick={openFilterPopup} 
            className="p-4 rounded-2xl transition-all duration-300 ease-smooth hover:scale-105 active:scale-95 focus:outline-none focus:ring-4"
            style={{
              background: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
              color: 'white',
              boxShadow: shadows.medium,
            }}
            aria-label="Open filters"
          >
            <FilterIcon />
          </button>
        </form>
      </div>

      {/* Enhanced Pull to refresh button */}
      <div className="px-6 pt-4">
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing || storeLoading}
          className="w-full mb-4 px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4"
          style={{
            background: isRefreshing || storeLoading 
              ? `linear-gradient(135deg, ${colors.neutral[400]} 0%, ${colors.neutral[500]} 100%)`
              : `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
            color: 'white',
            boxShadow: shadows.soft,
          }}
        >
          {isRefreshing ? '🔄 刷新中...' : '🔄 手动刷新列表'}
        </button>
      </div>

      {/* Main Content Area with enhanced styling */}
      <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-4">
        <AnnouncementBanner
          announcements={announcements}
          onAnnouncementClick={handleAnnouncementClick}
        />
        
        {isFetchingLocation && (
          <div 
            className="text-center py-4 text-sm font-medium rounded-2xl backdrop-blur-sm"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
              color: colors.neutral[600],
            }}
          >
            📍 正在获取位置信息...
          </div>
        )}

        {storeLoading && !isRefreshing ? (
          <div className="space-y-4">
            {[1, 2, 3].map(key => (
              <div 
                key={key} 
                className="p-6 rounded-2xl animate-pulse backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                  boxShadow: shadows.card,
                }}
              >
                <div className="h-6 bg-gradient-to-r from-neutral-300 to-neutral-200 rounded-xl w-3/4 mb-4"></div>
                <div className="h-4 bg-gradient-to-r from-neutral-300 to-neutral-200 rounded-lg w-full mb-3"></div>
                <div className="h-4 bg-gradient-to-r from-neutral-300 to-neutral-200 rounded-lg w-5/6 mb-4"></div>
                <div className="flex space-x-3 mt-4">
                  <div className="h-6 bg-gradient-to-r from-primary-300 to-primary-200 rounded-xl w-20"></div>
                  <div className="h-6 bg-gradient-to-r from-secondary-300 to-secondary-200 rounded-xl w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : currentActivitiesToDisplay.length === 0 ? (
          <div className="text-center py-16">
            <CustomEmpty
              description={
                isFiltersApplied 
                  ? "没有找到符合筛选条件的活动"
                  : "当前还没有任何活动"
              }
            />
            <button 
              onClick={isFiltersApplied ? openFilterPopup : navigateToCreate} 
              className="mt-6 px-8 py-4 text-sm font-semibold text-white rounded-2xl transition-all duration-300 ease-smooth hover:scale-105 active:scale-95 focus:outline-none focus:ring-4"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                boxShadow: shadows.medium,
              }}
            >
              {isFiltersApplied ? '🔧 调整筛选条件' : '➕ 去发布一个'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentActivitiesToDisplay.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => handleActivityClick(activity)}
                // Add distance to ActivityCard if it can display it
                // distance={activity.distanceKm}
              />
            ))}
            {hasMoreToLoad && (
              <button
                onClick={loadMoreActivities}
                disabled={isLoadingMore || storeLoading || isRefreshing}
                className="w-full mt-6 px-6 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-4"
                style={{
                  background: isLoadingMore 
                    ? `linear-gradient(135deg, ${colors.neutral[400]} 0%, ${colors.neutral[500]} 100%)`
                    : `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`,
                  color: isLoadingMore ? 'white' : colors.primary[700],
                  border: `2px solid ${colors.primary[300]}`,
                  boxShadow: shadows.soft,
                }}
              >
                {isLoadingMore ? '⏳ 加载中...' : '📚 加载更多活动'}
              </button>
            )}
            {!hasMoreToLoad && currentActivitiesToDisplay.length > 0 && (
              <p 
                className="text-center text-sm font-medium py-6 rounded-2xl backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)`,
                  color: colors.neutral[600],
                }}
              >
                🎯 没有更多活动了
              </p>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Filter Popup Modal */}
      {showFilterPopup && (
        <div 
          className="fixed inset-0 z-30 transition-all duration-500 ease-smooth backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => setShowFilterPopup(false)}
        />
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-4/5 max-w-md z-40 transform transition-all duration-500 ease-smooth ${showFilterPopup ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)`,
          backdropFilter: 'blur(20px)',
          boxShadow: shadows.large,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div 
            className="flex justify-between items-center p-6 border-b"
            style={{ borderColor: `${colors.neutral[200]}80` }}
          >
            <h3 
              className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
              }}
            >
              🎯 筛选活动
            </h3>
            <button 
              onClick={() => setShowFilterPopup(false)} 
              className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
              }}
            >
              <XMarkIcon />
            </button>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-6">
            {/* Enhanced Activity Type Section */}
            <div className="filter-section">
              <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🧗</span>
                活动类型
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {activityTypeOptions.map((option) => {
                  const isSelected = tempSelectedActivityTypes.includes(option.value as ActivityType);
                  return (
                    <label 
                      key={option.value} 
                      className={`flex items-center space-x-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 ease-smooth hover:scale-[1.02] active:scale-95 ${
                        isSelected ? 'ring-2' : ''
                      }`}
                      style={{
                        background: isSelected 
                          ? `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`
                          : `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
                        border: `2px solid ${isSelected ? colors.primary[400] : colors.neutral[200]}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={(e) => {
                          const newValue = e.target.checked 
                              ? [...tempSelectedActivityTypes, option.value as ActivityType] 
                              : tempSelectedActivityTypes.filter((v) => v !== option.value);
                          setTempSelectedActivityTypes(newValue);
                        }}
                      />
                      <div 
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected ? 'scale-110' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? colors.primary[500] : colors.neutral[400],
                          background: isSelected ? `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)` : 'white',
                        }}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : 'text-neutral-700'}`}>
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Difficulty Grades Section */}
            {(tempSelectedActivityTypes.length > 0 && currentGradeOptionsInPopup.length > 0) && (
              <div className="filter-section">
                <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  难度级别
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {currentGradeOptionsInPopup.map((option) => {
                    const isSelected = tempSelectedDifficultyGrades.includes(option.value);
                    return (
                      <label 
                        key={option.value} 
                        className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ease-smooth hover:scale-105 active:scale-95 ${
                          isSelected ? 'ring-2' : ''
                        }`}
                        style={{
                          background: isSelected 
                            ? `linear-gradient(135deg, ${colors.secondary[100]} 0%, ${colors.secondary[200]} 100%)`
                            : `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
                          border: `2px solid ${isSelected ? colors.secondary[400] : colors.neutral[200]}`,
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isSelected}
                          onChange={(e) => {
                            const newValue = e.target.checked 
                              ? [...tempSelectedDifficultyGrades, option.value] 
                              : tempSelectedDifficultyGrades.filter((v) => v !== option.value);
                            setTempSelectedDifficultyGrades(newValue);
                          }}
                        />
                        <div 
                          className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected ? 'scale-110' : ''
                          }`}
                          style={{
                            borderColor: isSelected ? colors.secondary[500] : colors.neutral[400],
                            background: isSelected ? `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)` : 'white',
                          }}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-secondary-700' : 'text-neutral-700'}`}>
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div 
            className="p-6 border-t flex gap-4"
            style={{ 
              borderColor: `${colors.neutral[200]}80`,
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <button 
              type="button" 
              onClick={handleResetFiltersInPopup} 
              className="flex-1 px-6 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ease-smooth hover:scale-105 active:scale-95 focus:outline-none focus:ring-4"
              style={{
                background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)`,
                color: colors.neutral[700],
                border: `2px solid ${colors.neutral[300]}`,
              }}
            >
              🔄 重置
            </button>
            <button 
              type="button" 
              onClick={handleApplyFilters} 
              className="flex-1 px-6 py-4 text-sm font-semibold text-white rounded-2xl transition-all duration-300 ease-smooth hover:scale-105 active:scale-95 focus:outline-none focus:ring-4"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                boxShadow: shadows.medium,
              }}
            >
              ✨ 应用筛选
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityList;