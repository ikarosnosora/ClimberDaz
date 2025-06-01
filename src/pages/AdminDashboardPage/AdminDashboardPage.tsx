import React from 'react';
// import { NavBar } from 'antd-mobile'; // Removed
import { useNavigate } from 'react-router-dom';
import { colors, shadows } from '../../utils/designSystem';
import AnnouncementManagement from './AnnouncementManagement';
import ContentModeration from './ContentModeration';
import UserManagement from './UserManagement';
import AdminStats from './AdminStats';

// Enhanced Back Arrow Icon
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
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
          ⚙️ {title}
        </h1>
      </div>
    </div>
  </div>
);

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/'); 
  };

  return (
    <div 
      className="min-h-screen pb-8"
      style={{
        background: `linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)`,
      }}
    >
      <EnhancedPageHeader title="管理后台" onBack={handleBack} />
      
      <div className="px-6">
        {/* Enhanced Welcome Section */}
        <div 
          className="p-6 rounded-2xl mb-8 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
            boxShadow: shadows.card,
            border: `1px solid rgba(255, 255, 255, 0.3)`,
          }}
        >
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
            }}
          >
            🏔️ 欢迎来到管理后台
          </h2>
          <p className="text-lg font-medium" style={{ color: colors.neutral[600] }}>
            管理和监控 ClimberDaz 攀岩社区的各项功能
          </p>
        </div>
        
        {/* Enhanced Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enhanced Stats Card */}
          <div 
            className="p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
              boxShadow: shadows.card,
              border: `1px solid rgba(255, 255, 255, 0.3)`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)` }}
              >
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.neutral[700] }}>
                统计信息
              </h3>
            </div>
            <AdminStats />
          </div>

          {/* Enhanced User Management Card */}
          <div 
            className="p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
              boxShadow: shadows.card,
              border: `1px solid rgba(255, 255, 255, 0.3)`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colors.secondary[100]} 0%, ${colors.secondary[200]} 100%)` }}
              >
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.neutral[700] }}>
                用户管理
              </h3>
            </div>
            <UserManagement />
          </div>

          {/* Enhanced Announcement Management Card */}
          <div 
            className="p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
              boxShadow: shadows.card,
              border: `1px solid rgba(255, 255, 255, 0.3)`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colors.accent[100]} 0%, ${colors.accent[200]} 100%)` }}
              >
                <span className="text-2xl">📢</span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.neutral[700] }}>
                公告管理
              </h3>
            </div>
            <AnnouncementManagement />
          </div>

          {/* Enhanced Content Moderation Card */}
          <div 
            className="p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
              boxShadow: shadows.card,
              border: `1px solid rgba(255, 255, 255, 0.3)`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${colors.warning.soft} 0%, ${colors.warning.subtle} 100%)` }}
              >
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.neutral[700] }}>
                内容审核
              </h3>
            </div>
            <ContentModeration />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 