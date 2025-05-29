import React from 'react';
// import { Card, Grid } from 'antd-mobile'; // Removed
// import { UserOutline, UnorderedListOutline, ClockCircleOutline } from 'antd-mobile-icons'; // Removed
import { useStore } from '../../store/useStore';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-slate-50 p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center h-full">
    <div className="flex items-center text-gray-600 mb-2">
      {icon}
      <span className="ml-2 text-sm font-medium whitespace-nowrap">{title}</span>
    </div>
    <p className="text-2xl font-semibold text-gray-800">{value}</p>
  </div>
);


const AdminStats: React.FC = () => {
  const { allUsers, activities } = useStore();

  const newUsersToday = allUsers.filter(u => 
    u.createdAt && new Date(u.createdAt).toDateString() === new Date().toDateString()
  ).length;
  
  const activeActivities = activities.filter(a => 
    a.status === 'OPEN' || a.status === 'ONGOING'
  ).length;

  const totalActivitiesCreated = activities.length;

  // style={{ marginTop: '20px', marginBottom: '20px' }} -> my-5 (applied on parent in AdminDashboardPage)
  // h3 -> text-lg font-semibold text-gray-700 mb-3 (also managed by parent)
  // Grid columns={3} gap={12} -> grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 (making it more responsive)
  // Card title attribute handled by StatCard props
  // className="stat-card" from antd Card integrated into StatCard styles

  const stats = [
    { title: "总用户数", value: allUsers.length, icon: <UserIcon /> },
    { title: "今日新增", value: newUsersToday, icon: <UserIcon /> },
    { title: "活动总数", value: totalActivitiesCreated, icon: <ListIcon /> },
    { title: "当前活跃活动", value: activeActivities, icon: <ClockIcon /> },
  ];

  return (
    <div className="admin-stats">
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        {stats.map(stat => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
        {/* Add more stats as needed by adding to the stats array */}
      </div>
    </div>
  );
};

export default AdminStats; 