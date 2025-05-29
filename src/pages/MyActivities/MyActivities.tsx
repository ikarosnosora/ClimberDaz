import React, { useEffect, useState, SVGProps } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ActivityCard from '../../components/ActivityCard/ActivityCard';
import { Activity } from '../../types';
import { useActivitySelector, useUserSelector } from '../../store/useOptimizedStore';
import { showWarning } from '../../utils/notifications';

// --- Start of new local components ---

// Back Icon for PageHeader
const BackIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// PageHeader component
interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}
const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack }) => (
  <div className="bg-white shadow-sm flex items-center p-4 sticky top-0 z-10">
    {onBack && (
      <button onClick={onBack} className="mr-2 text-gray-600 hover:text-gray-800">
        <BackIcon />
      </button>
    )}
    <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
  </div>
);

// Custom Tab Button
interface CustomTabButtonProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}
const CustomTabButton: React.FC<CustomTabButtonProps> = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-2 text-center text-sm font-medium border-b-2 transition-colors
      ${isActive 
        ? 'border-blue-500 text-blue-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }
    `}
  >
    {title}
  </button>
);
// --- End of new local components ---

// --- Start of new local components for EmptyState and Skeleton --- 

// Placeholder SVG for Empty State (e.g., a simple folder or list icon)
const EmptyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300 mb-4" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776M9 12.75v6m3-6v6m3-6v6M3.27 19.745c-.218.218-.53.322-.877.322H2.25a.75.75 0 01-.75-.75V11.166c0-.47.162-.92.468-1.282A1.5 1.5 0 013 9.523v10.222zM20.73 19.745c.218.218.53.322.877.322h.143a.75.75 0 00.75-.75V11.166c0-.47-.162-.92-.468-1.282A1.5 1.5 0 0021 9.523v10.222z" />
  </svg>
);

// EmptyState component
interface EmptyStateProps {
  message: string;
}
const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-center p-10 h-full">
    <EmptyIcon />
    <p className="text-gray-500 text-lg">{message}</p>
  </div>
);

// SkeletonCard component (placeholder for ActivityCard)
const SkeletonCard: React.FC = () => (
  <div className="bg-white shadow-md rounded-lg p-4 mb-3 animate-pulse w-full mx-auto">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div> {/* Title */}
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div> {/* Date/Time */}
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div> {/* Location */}
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div> {/* Host Avatar */}
        <div className="h-4 bg-gray-200 rounded w-16"></div> {/* Host Name */}
      </div>
      <div className="h-8 bg-gray-300 rounded w-20"></div> {/* Price/Join Button Placeholder */}
    </div>
  </div>
);

// --- End of new local components for EmptyState and Skeleton ---

const MyActivities: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserSelector();
  const { activities: allActivities, isLoadingActivities: storeLoading } = useActivitySelector();

  const initialTab = searchParams.get('type') === 'joined' ? 'joined' : 'hosted';
  const [activeTab, setActiveTab] = useState<'hosted' | 'joined'>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setIsLoading(true);
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
  }, [activeTab, user, allActivities]);
  
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
        // <div className="p-4">
        //   <div className="animate-pulse">
        //     <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        //     <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        //     <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        //   </div>
        // </div>
        // Render a few SkeletonCards
        <div className="space-y-2 p-2">
            <SkeletonCard />
            <SkeletonCard />
        </div>
      );
    }

    if (filteredActivities.length === 0) {
      return (
        // <div className="flex flex-col items-center justify-center h-full">
        //   <p className="text-gray-500">
        //     {activeTab === 'hosted' ? '你还没有发起过活动' : '你还没有参与过活动'}
        //   </p>
        // </div>
        <EmptyState message={activeTab === 'hosted' ? '你还没有发起过活动' : '你还没有参与过活动'} />
      );
    }
    return (
      <div className="p-2">
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
    // <div className="my-activities-page">
    <div className="flex flex-col h-screen bg-gray-100"> {/* Replaced .my-activities-page styles */}
      {/* <NavBar onBack={() => navigate('/profile')}>我的活动</NavBar> */}
      <PageHeader title="我的活动" onBack={() => navigate('/profile')} />
      {/* <Tabs 
        activeKey={activeTab} 
        onChange={(key: string) => setActiveTab(key as 'hosted' | 'joined')} 
        className="my-activities-tabs" // Style to be migrated
      >
        <Tabs.Tab title="我发起的" key="hosted">
          {renderContent()}
        </Tabs.Tab>
        <Tabs.Tab title="我参与的" key="joined">
          {renderContent()}
        </Tabs.Tab>
      </Tabs> */}
      <div className="flex border-b border-gray-200 bg-white">
        <CustomTabButton 
          title="我发起的" 
          isActive={activeTab === 'hosted'} 
          onClick={() => setActiveTab('hosted')}
        />
        <CustomTabButton 
          title="我参与的" 
          isActive={activeTab === 'joined'} 
          onClick={() => setActiveTab('joined')}
        />
      </div>
      {/* Content will be rendered here based on activeTab by renderContent */}
      <div className="flex-1 overflow-y-auto p-2"> {/* Replaced .activities-list-container styles */}
        {renderContent()}
      </div>
    </div>
  );
};

export default MyActivities; 