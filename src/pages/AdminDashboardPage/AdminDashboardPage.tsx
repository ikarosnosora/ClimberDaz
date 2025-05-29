import React from 'react';
// import { NavBar } from 'antd-mobile'; // Removed
import { useNavigate } from 'react-router-dom';
import AnnouncementManagement from './AnnouncementManagement';
import ContentModeration from './ContentModeration';
import UserManagement from './UserManagement';
import AdminStats from './AdminStats';

// Simple Back Arrow Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// Simple PageHeader component (can be extracted later)
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

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/'); 
  };

  // style={{ paddingBottom: '20px'}} -> pb-5
  // style={{ padding: '16px' }} -> p-4
  return (
    <div className="admin-dashboard-page pb-5 min-h-screen bg-gray-100">
      <PageHeader title="管理后台" onBack={handleBack} />
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">欢迎来到管理后台</h2>
        <p className="text-gray-600 mb-6">这里可以管理应用内的各项设置和内容。</p>
        
        {/* Layout for dashboard sections using Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">统计信息</h3>
            <AdminStats />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">用户管理</h3>
            <UserManagement />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">公告管理</h3>
            <AnnouncementManagement />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">内容审核</h3>
            <ContentModeration />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage; 