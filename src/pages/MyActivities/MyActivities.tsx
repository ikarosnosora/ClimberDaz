import React, { useEffect, useState, SVGProps } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ActivityCard from '../../components/ActivityCard/ActivityCard';
import { Activity } from '../../types';
import { useActivitySelector, useUserSelector, useActivityActions } from '../../store/useOptimizedStore';
import { showWarning } from '../../utils/notifications';
import { colors, shadows } from '../../utils/designSystem';

// Enhanced Back Icon for PageHeader
const BackIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// Enhanced PageHeader component
interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}
const EnhancedPageHeader: React.FC<PageHeaderProps> = ({ title, onBack }) => (
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
        {onBack && (
          <button 
            onClick={onBack} 
            className="absolute left-0 p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%)`,
              color: colors.primary[600],
            }}
          >
            <BackIcon />
          </button>
        )}
        <h1 
          className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
          }}
        >
          📋 {title}
        </h1>
      </div>
    </div>
  </div>
);

// Enhanced Custom Tab Button
interface CustomTabButtonProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}
const EnhancedCustomTabButton: React.FC<CustomTabButtonProps> = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 px-4 text-center text-sm font-bold rounded-t-2xl transition-all duration-300 ${
      isActive ? 'text-white' : ''
    }`}
    style={{
      background: isActive 
        ? `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[600]} 100%)`
        : `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
      color: isActive ? 'white' : colors.neutral[600],
      borderBottom: isActive ? 'none' : `2px solid ${colors.neutral[200]}`,
    }}
  >
    {title}
  </button>
);

// Enhanced Empty State
const EnhancedEmptyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776M9 12.75v6m3-6v6m3-6v6M3.27 19.745c-.218.218-.53.322-.877.322H2.25a.75.75 0 01-.75-.75V11.166c0-.47.162-.92.468-1.282A1.5 1.5 0 013 9.523v10.222zM20.73 19.745c.218.218.53.322.877.322h.143a.75.75 0 00.75-.75V11.166c0-.47-.162-.92-.468-1.282A1.5 1.5 0 0021 9.523v10.222z" />
  </svg>
);

interface EmptyStateProps {
  message: string;
}
const EnhancedEmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div 
    className="flex flex-col items-center justify-center text-center p-12 rounded-2xl backdrop-blur-sm mx-6"
    style={{
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)`,
      boxShadow: shadows.card,
    }}
  >
    <div style={{ color: colors.neutral[400] }}>
      <EnhancedEmptyIcon />
    </div>
    <p className="text-lg font-semibold" style={{ color: colors.neutral[600] }}>
      {message}
    </p>
  </div>
);

// Enhanced SkeletonCard component
const EnhancedSkeletonCard: React.FC = () => (
  <div 
    className="p-6 rounded-2xl mb-4 animate-pulse backdrop-blur-sm"
    style={{
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)`,
      boxShadow: shadows.soft,
    }}
  >
    <div 
      className="h-6 rounded-xl w-3/4 mb-3"
      style={{ background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)` }}
    ></div>
    <div 
      className="h-4 rounded-lg w-1/2 mb-2"
      style={{ background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)` }}
    ></div>
    <div 
      className="h-4 rounded-lg w-1/3 mb-4"
      style={{ background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)` }}
    ></div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div 
          className="w-10 h-10 rounded-full"
          style={{ background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)` }}
        ></div>
        <div 
          className="h-4 rounded-lg w-16"
          style={{ background: `linear-gradient(135deg, ${colors.neutral[200]} 0%, ${colors.neutral[300]} 100%)` }}
        ></div>
      </div>
      <div 
        className="h-8 rounded-xl w-20"
        style={{ background: `linear-gradient(135deg, ${colors.neutral[300]} 0%, ${colors.neutral[400]} 100%)` }}
      ></div>
    </div>
  </div>
);

const MyActivities: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserSelector();
  const { activities: allActivities, isLoadingActivities: storeLoading } = useActivitySelector();
  const { fetchActivities } = useActivityActions();

  const initialTab = searchParams.get('type') === 'joined' ? 'joined' : 'hosted';
  const [activeTab, setActiveTab] = useState<'hosted' | 'joined'>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setIsLoading(true);
    
    // Fetch activities if not loaded yet
    if (allActivities.length === 0 && !storeLoading) {
              if (import.meta.env.DEV) {
          console.log('[MyActivities] Fetching activities from API...');
        }
      fetchActivities().catch((error: any) => {
        console.error('[MyActivities] Failed to fetch activities:', error);
      });
    }
    
    if (user && allActivities) {
      let relevantActivities: Activity[] = [];
      if (activeTab === 'hosted') {
        relevantActivities = allActivities.filter(act => act.hostId === user.openid);
      } else { // 'joined'
        relevantActivities = allActivities.filter(act => act.participantIds?.includes(user.openid) && act.hostId !== user.openid);
      }
      setFilteredActivities(relevantActivities.sort((a,b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()));
    }
    setIsLoading(false); // Set loading to false after filtering
  }, [activeTab, user, allActivities, storeLoading, fetchActivities]);
  
  // Example: If activities were fetched from an API
  // useEffect(() => {
  //  const loadActivities = async () => {
  //    setIsLoading(true);
  //    await fetchActivities(); // Assuming fetchActivities updates 'allActivities' in store
  //    setIsLoading(false);
  //  };
  //  loadActivities();
  // }, [fetchActivities]);

  const renderContent = () => {
    if (isLoading || storeLoading) {
      return (
        <div className="space-y-4 p-6">
          <EnhancedSkeletonCard />
          <EnhancedSkeletonCard />
        </div>
      );
    }

    if (filteredActivities.length === 0) {
      return (
        <div className="pt-10">
          <EnhancedEmptyState 
            message={activeTab === 'hosted' ? '你还没有发起过活动' : '你还没有参与过活动'} 
          />
        </div>
      );
    }

    return (
      <div className="p-6 space-y-4">
        {filteredActivities.map(activity => (
          <ActivityCard 
            key={activity.id} 
            activity={activity} 
            onClick={() => navigate(`/activity/${activity.id}`)} 
          />
        ))}
      </div>
    );
  };

  if (!user) {
    showWarning('请先登录');
    navigate('/login', { replace: true });
    return null;
  }
  
  return (
    <div 
      className="flex flex-col h-screen"
      style={{
        background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
      }}
    >
      <EnhancedPageHeader title="我的活动" onBack={() => navigate('/profile')} />
      
      <div 
        className="flex border-b backdrop-blur-sm mx-6"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
          borderColor: `rgba(255, 255, 255, 0.5)`,
          borderRadius: '1rem 1rem 0 0',
        }}
      >
        <EnhancedCustomTabButton 
          title="🚀 我发起的" 
          isActive={activeTab === 'hosted'} 
          onClick={() => setActiveTab('hosted')}
        />
        <EnhancedCustomTabButton 
          title="🤝 我参与的" 
          isActive={activeTab === 'joined'} 
          onClick={() => setActiveTab('joined')}
        />
      </div>

      <div 
        className="flex-1 overflow-y-auto mx-6 rounded-b-2xl backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
          boxShadow: shadows.card,
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default MyActivities; 