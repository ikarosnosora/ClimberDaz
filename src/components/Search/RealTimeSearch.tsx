import React, { useState, useEffect, useCallback, useRef } from 'react';
import { colors, shadows } from '../../utils/designSystem';
import { Activity, ActivityType } from '../../types';

// Enhanced Search Icon with Animation
const SearchIcon = ({ isSearching }: { isSearching?: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className={`w-5 h-5 transition-all duration-300 ${isSearching ? 'animate-pulse text-primary-500' : 'text-neutral-400'}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

// Clear Icon
const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Loading Dots Animation
const LoadingDots = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

// Search Result Item with Highlighting
interface SearchResultItemProps {
  activity: Activity;
  searchTerm: string;
  onClick: (activity: Activity) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ activity, searchTerm, onClick }) => {
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span 
          key={index} 
          className="font-bold rounded px-1"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`,
            color: colors.primary[700] 
          }}
        >
          {part}
        </span>
      ) : part
    );
  };

  const getActivityTypeEmoji = (type: ActivityType) => {
    const emojiMap = {
      [ActivityType.BOULDERING]: '🧗‍♀️',
      [ActivityType.TOP_ROPE_AUTO_BELAY]: '🔗',
      [ActivityType.TOP_ROPE_MANUAL_BELAY]: '🔗',
      [ActivityType.LEAD_CLIMBING]: '🚀',
      [ActivityType.OUTDOOR]: '🏔️',
      [ActivityType.TRAINING]: '💪',
    };
    return emojiMap[type] || '🧗‍♀️';
  };

  return (
    <div
      onClick={() => onClick(activity)}
      className="p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-xl mb-2"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.soft,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.primary[300];
        e.currentTarget.style.boxShadow = shadows.medium;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.neutral[200];
        e.currentTarget.style.boxShadow = shadows.soft;
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-base leading-tight">
          {highlightText(activity.title, searchTerm)}
        </h3>
        <div className="flex gap-1 ml-2">
          {activity.types.map((type, index) => (
            <span key={index} className="text-lg">
              {getActivityTypeEmoji(type)}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm mb-2" style={{ color: colors.neutral[600] }}>
        📍 {highlightText(activity.locationText, searchTerm)}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: colors.neutral[500] }}>
          👥 {activity.participantCount}/{activity.slotMax}
        </span>
        <span style={{ color: colors.neutral[500] }}>
          ⏰ {new Date(activity.datetime).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

// Filter Chip Component
interface FilterChipProps {
  label: string;
  onRemove: () => void;
  type?: 'activity' | 'grade' | 'search';
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove, type = 'activity' }) => {
  const getChipStyle = () => {
    switch (type) {
      case 'search':
        return {
          background: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`,
          color: colors.primary[700],
          border: `1px solid ${colors.primary[300]}`,
        };
      case 'grade':
        return {
          background: `linear-gradient(135deg, ${colors.secondary[100]} 0%, ${colors.secondary[200]} 100%)`,
          color: colors.secondary[700],
          border: `1px solid ${colors.secondary[300]}`,
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
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 animate-fade-in"
      style={getChipStyle()}
    >
      <span className="max-w-32 truncate">{label}</span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200"
      >
        <XMarkIcon />
      </button>
    </div>
  );
};

// Real-time Search Component
interface RealTimeSearchProps {
  activities: Activity[];
  onSearchResults: (results: Activity[]) => void;
  onActivityClick: (activity: Activity) => void;
  placeholder?: string;
  debounceMs?: number;
  maxResults?: number;
  filters?: {
    types: ActivityType[];
    grades: string[];
  };
  onFiltersChange?: (filters: { types: ActivityType[]; grades: string[] }) => void;
}

const RealTimeSearch: React.FC<RealTimeSearchProps> = ({
  activities,
  onSearchResults,
  onActivityClick,
  placeholder = "🔍 实时搜索活动名称或地点...",
  debounceMs = 300,
  maxResults = 10,
  filters = { types: [], grades: [] },
  onFiltersChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Activity[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const performSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      onSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay for demonstration
    setTimeout(() => {
      const filteredResults = activities
        .filter(activity => {
          const matchesSearch = 
            activity.title.toLowerCase().includes(term.toLowerCase()) ||
            activity.locationText.toLowerCase().includes(term.toLowerCase());
          
          const matchesTypeFilter = filters.types.length === 0 || 
            filters.types.some(type => activity.types.includes(type));
          
          const matchesGradeFilter = filters.grades.length === 0 || 
            (activity.grades && activity.grades.some(grade => filters.grades.includes(grade)));
          
          return matchesSearch && matchesTypeFilter && matchesGradeFilter;
        })
        .slice(0, maxResults)
        .sort((a, b) => {
          // Prioritize title matches over location matches
          const aTitle = a.title.toLowerCase().includes(term.toLowerCase());
          const bTitle = b.title.toLowerCase().includes(term.toLowerCase());
          if (aTitle && !bTitle) return -1;
          if (!aTitle && bTitle) return 1;
          
          // Then sort by date
          return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        });
      
      setSearchResults(filteredResults);
      onSearchResults(filteredResults);
      setIsSearching(false);
    }, 100);
  }, [activities, filters, maxResults, onSearchResults]);

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(true);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, debounceMs);
  };

  // Handle search submit
  const handleSearchSubmit = (term?: string) => {
    const finalTerm = term || searchTerm;
    if (finalTerm.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const newSearches = [finalTerm, ...prev.filter(s => s !== finalTerm)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
        return newSearches;
      });
      
      // Perform immediate search
      performSearch(finalTerm);
      setShowResults(false);
      searchInputRef.current?.blur();
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    onSearchResults([]);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    searchInputRef.current?.focus();
  };

  // Handle activity click
  const handleActivityClick = (activity: Activity) => {
    onActivityClick(activity);
    setShowResults(false);
    searchInputRef.current?.blur();
  };

  // Handle filter chip removal
  const handleRemoveTypeFilter = (typeToRemove: ActivityType) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        types: filters.types.filter(type => type !== typeToRemove),
      });
    }
  };

  const handleRemoveGradeFilter = (gradeToRemove: string) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        grades: filters.grades.filter(grade => grade !== gradeToRemove),
      });
    }
  };

  const handleRemoveSearchFilter = () => {
    handleClearSearch();
  };

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close search results
      if (
        resultsContainerRef.current &&
        !resultsContainerRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
      
      // Close filter panel
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest('button[title="筛选选项"]')
      ) {
        setShowFilterPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasActiveFilters = searchTerm || filters.types.length > 0 || filters.grades.length > 0;

  // 处理搜索框展开
  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  // 处理搜索框收起
  const handleCollapse = () => {
    if (!searchTerm && !showResults) {
      setIsExpanded(false);
    }
  };

  // 处理筛选面板切换
  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  // 筛选面板组件
  const FilterPanel: React.FC = () => (
    <div
      ref={filterPanelRef}
      className="absolute top-full right-0 mt-2 w-80 z-50 rounded-xl overflow-hidden backdrop-blur-lg animate-fade-in"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)`,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.large,
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.neutral[700] }}>
            筛选选项
          </h3>
          <button
            onClick={() => setShowFilterPanel(false)}
            className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <XMarkIcon />
          </button>
        </div>

        {/* 活动类型筛选 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2" style={{ color: colors.neutral[600] }}>
            活动类型
          </h4>
          <div className="flex flex-wrap gap-2">
            {['户外', '室内', '攀岩', '溯溪', '徒步', '野营'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  const newTypes = filters.types.includes(type as ActivityType)
                    ? filters.types.filter(t => t !== type)
                    : [...filters.types, type as ActivityType];
                  onFiltersChange?.({ ...filters, types: newTypes });
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.types.includes(type as ActivityType)
                    ? 'text-white'
                    : 'hover:scale-105'
                }`}
                style={{
                  background: filters.types.includes(type as ActivityType)
                    ? `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`
                    : `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
                  color: filters.types.includes(type as ActivityType)
                    ? 'white'
                    : colors.neutral[700],
                  border: `1px solid ${filters.types.includes(type as ActivityType) ? colors.primary[500] : colors.neutral[300]}`,
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 难度等级筛选 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2" style={{ color: colors.neutral[600] }}>
            难度等级
          </h4>
          <div className="flex flex-wrap gap-2">
            {['初级', '中级', '高级', '专业'].map((grade) => (
              <button
                key={grade}
                onClick={() => {
                  const newGrades = filters.grades.includes(grade)
                    ? filters.grades.filter(g => g !== grade)
                    : [...filters.grades, grade];
                  onFiltersChange?.({ ...filters, grades: newGrades });
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.grades.includes(grade)
                    ? 'text-white'
                    : 'hover:scale-105'
                }`}
                style={{
                  background: filters.grades.includes(grade)
                    ? `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`
                    : `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
                  color: filters.grades.includes(grade)
                    ? 'white'
                    : colors.neutral[700],
                  border: `1px solid ${filters.grades.includes(grade) ? colors.secondary[500] : colors.neutral[300]}`,
                }}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: colors.neutral[200] }}>
          <button
            onClick={() => {
              onFiltersChange?.({ types: [], grades: [] });
            }}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
              color: colors.neutral[700],
              border: `1px solid ${colors.neutral[300]}`,
            }}
          >
            清除筛选
          </button>
          <button
            onClick={() => setShowFilterPanel(false)}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
              border: `1px solid ${colors.primary[500]}`,
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {!isExpanded ? (
        /* Compact Search Bar */
        <div className="flex items-center gap-2">
          <button
            onClick={handleExpand}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
              border: `1px solid ${colors.neutral[200]}`,
              boxShadow: shadows.soft,
            }}
          >
            <SearchIcon />
            <span className="text-sm font-medium" style={{ color: colors.neutral[600] }}>
              点击搜索活动...
            </span>
          </button>
          
          {/* 筛选按钮 */}
          <button
            onClick={toggleFilterPanel}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 relative"
            style={{
              background: hasActiveFilters 
                ? `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`
                : `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
              border: `1px solid ${hasActiveFilters ? colors.primary[300] : colors.neutral[200]}`,
              boxShadow: shadows.soft,
              color: hasActiveFilters ? colors.primary[600] : colors.neutral[500],
            }}
            title="筛选选项"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border border-white"></div>
            )}
          </button>
        </div>
      ) : (
        /* Expanded Search Bar */
        <>
          {/* Search Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon isSearching={isSearching} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={(e) => {
                setShowResults(true);
                e.target.style.borderColor = colors.primary[400];
                e.target.style.boxShadow = `0 0 0 4px ${colors.primary[100]}`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchSubmit();
                }
                if (e.key === 'Escape') {
                  setShowResults(false);
                  handleCollapse();
                  searchInputRef.current?.blur();
                }
              }}
              placeholder={placeholder}
              className="w-full pl-12 pr-12 py-3 text-base font-medium rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-4"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                border: `2px solid ${colors.neutral[200]}`,
                boxShadow: shadows.soft,
                color: colors.neutral[800],
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.neutral[200];
                e.target.style.boxShadow = shadows.soft;
                setTimeout(handleCollapse, 150);
              }}
            />
            
            {/* Clear/Loading Button */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              {isSearching ? (
                <LoadingDots />
              ) : searchTerm ? (
                <button
                  onClick={handleClearSearch}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200 p-1 rounded-full hover:bg-neutral-100"
                >
                  <XMarkIcon />
                </button>
              ) : (
                <button
                  onClick={handleCollapse}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200 p-1 rounded-full hover:bg-neutral-100"
                  title="收起搜索"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
              {searchTerm && (
                <FilterChip
                  label={`搜索: "${searchTerm}"`}
                  onRemove={handleRemoveSearchFilter}
                  type="search"
                />
              )}
              {filters.types.map((type) => (
                <FilterChip
                  key={type}
                  label={`类型: ${type}`}
                  onRemove={() => handleRemoveTypeFilter(type)}
                  type="activity"
                />
              ))}
              {filters.grades.map((grade) => (
                <FilterChip
                  key={grade}
                  label={`难度: ${grade}`}
                  onRemove={() => handleRemoveGradeFilter(grade)}
                  type="grade"
                />
              ))}
            </div>
          )}

          {/* Search Results Dropdown */}
          {showResults && (searchTerm || recentSearches.length > 0) && (
            <div
              ref={resultsContainerRef}
              className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl overflow-hidden backdrop-blur-lg animate-fade-in"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)`,
                border: `1px solid ${colors.neutral[200]}`,
                boxShadow: shadows.large,
                maxHeight: '70vh',
                overflowY: 'auto',
              }}
            >
              {searchTerm ? (
                <>
                  {/* Search Results */}
                  {isSearching ? (
                    <div className="p-6 text-center">
                      <LoadingDots />
                      <p className="mt-2 text-sm" style={{ color: colors.neutral[600] }}>
                        正在搜索...
                      </p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-3 px-2" style={{ color: colors.neutral[700] }}>
                        🎯 搜索结果 ({searchResults.length})
                      </h3>
                      {searchResults.map((activity) => (
                        <SearchResultItem
                          key={activity.id}
                          activity={activity}
                          searchTerm={searchTerm}
                          onClick={handleActivityClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-2">🔍</div>
                      <p className="text-lg font-semibold mb-1" style={{ color: colors.neutral[600] }}>
                        未找到相关活动
                      </p>
                      <p className="text-sm" style={{ color: colors.neutral[500] }}>
                        尝试其他关键词或调整筛选条件
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Recent Searches */
                recentSearches.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-3 px-2" style={{ color: colors.neutral[700] }}>
                      ⏱️ 最近搜索
                    </h3>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(search);
                          handleSearchSubmit(search);
                        }}
                        className="w-full text-left p-3 rounded-xl mb-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)`,
                          border: `1px solid ${colors.neutral[200]}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = colors.primary[300];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = colors.neutral[200];
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-lg">🕐</div>
                          <span className="font-medium">{search}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <FilterPanel />
      )}
    </div>
  );
};

export default RealTimeSearch; 