import React, { useState } from 'react';
// import { List, Card, Tabs } from 'antd-mobile'; // Removed

interface TabPanelProps {
  children: React.ReactNode;
  isActive: boolean;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, isActive }) => {
  if (!isActive) return null;
  return <div className="p-4">{children}</div>;
};

interface ModerationListItemProps {
  title: React.ReactNode;
  description?: string;
}

const ModerationListItem: React.FC<ModerationListItemProps> = ({ title, description }) => (
  <div className="py-3 border-b border-gray-200 last:border-b-0">
    <div className="text-sm text-gray-800 font-medium">{title}</div>
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    {/* Action buttons (Approve, Reject) would go here */}
  </div>
);

const EmptyListMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="py-3 text-sm text-gray-500">{message}</div>
);

const ContentModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('activities');

  // Placeholder data
  const activitiesToReview = [
    { id: '1', title: '活动标题示例1', user: '用户A', time: '2小时前提交' },
    { id: '2', title: '活动标题示例2', user: '用户B', time: '5小时前提交' },
  ];
  const commentsToReview = [
    { id: 'c1', content: '评论内容示例...', activity: '活动C', user: '用户D', time: '10分钟前' },
  ];
  const profilesToReview = [
    { id: 'p1', name: '用户昵称/头像', user: '用户E', time: '注册时间: ...' },
  ];

  const renderStatusTag = () => <span className="ml-2 text-xs text-orange-500 font-semibold">[待审核]</span>;

  // style={{ marginTop: '20px' }} -> Removed, parent AdminDashboardPage handles section spacing
  // h3 -> Removed, parent AdminDashboardPage handles section title
  // Outer Card removed, as parent provides a card-like structure for this section.
  return (
    <div className="content-moderation">
      <div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('activities')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              活动审核
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              评论审核
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profiles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              用户资料审核
            </button>
          </nav>
        </div>

        <TabPanel isActive={activeTab === 'activities'}>
          <h4 className="text-md font-semibold text-gray-700 mb-2">待审核活动</h4>
          {activitiesToReview.length > 0 ? (
            activitiesToReview.map(item => (
              <ModerationListItem 
                key={item.id} 
                title={<>{item.title} {renderStatusTag()}</>}
                description={`${item.user} | ${item.time}`}
              />
            ))
          ) : (
            <EmptyListMessage message="没有更多待审核活动了。" />
          )}
        </TabPanel>

        <TabPanel isActive={activeTab === 'comments'}>
          <h4 className="text-md font-semibold text-gray-700 mb-2">待审核评论</h4>
          {commentsToReview.length > 0 ? (
            commentsToReview.map(item => (
              <ModerationListItem 
                key={item.id} 
                title={<>{item.content} {renderStatusTag()}</>}
                description={`${item.activity} | ${item.user} | ${item.time}`}
              />
            ))
          ) : (
            <EmptyListMessage message="没有更多待审核评论了。" />
          )}
        </TabPanel>

        <TabPanel isActive={activeTab === 'profiles'}>
          <h4 className="text-md font-semibold text-gray-700 mb-2">待审核用户资料 (例如头像、昵称)</h4>
          {profilesToReview.length > 0 ? (
            profilesToReview.map(item => (
              <ModerationListItem 
                key={item.id} 
                title={<>{item.name} {renderStatusTag()}</>}
                description={`${item.user} | ${item.time}`}
              />
            ))
          ) : (
            <EmptyListMessage message="没有更多待审核用户资料了。" />
          )}
        </TabPanel>
      </div>
    </div>
  );
};

export default ContentModeration; 