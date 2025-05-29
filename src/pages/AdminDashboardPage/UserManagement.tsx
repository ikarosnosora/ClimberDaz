import React, { useState, useRef, useEffect } from 'react';
// import { List, Button, Modal, Tag, Avatar, Space, Popover, Toast } from 'antd-mobile'; // Removed
// import { EditSOutline, ForbidFill, CheckOutline } from 'antd-mobile-icons'; // Removed
import { useUserSelector, useUserActions } from '../../store/useOptimizedStore';
import { showSuccess, showWarning } from '../../utils/notifications';
import type { User } from '../../types';
import dayjs from 'dayjs';

// SVG Icons
const EditIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);
const BanIcon = ({ className = "w-5 h-5" }: { className?: string }) => ( // ForbidFill replacement
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);
const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

interface CustomPopoverMenuProps {
  actions: Array<{ text: string; key: string; icon?: React.ReactNode; disabled?: boolean }>;
  onAction: (actionKey: string) => void;
  trigger: React.ReactNode;
}

const CustomPopoverMenu: React.FC<CustomPopoverMenuProps> = ({ actions, onAction, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5 py-1">
          {actions.map(action => (
            <button
              key={action.key}
              onClick={() => { onAction(action.key); setIsOpen(false); }}
              disabled={action.disabled}
              className={`flex items-center w-full px-4 py-2 text-sm text-left ${action.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const UserManagement: React.FC = () => {
  const { allUsers, user: currentUser } = useUserSelector();
  const { updateUserStatus } = useUserActions();
  // isLoading state is not directly used in this refactor with window.confirm and alert.
  // If a more sophisticated loading state for specific actions is needed later, it can be added.

  const handleToggleBan = (userToUpdate: User) => {
    if (userToUpdate.openid === currentUser?.openid) {
      showWarning('不能操作当前登录的管理员账户');
      return;
    }
    if (window.confirm(`确定要${userToUpdate.isBanned ? '解封' : '封禁'}用户 ${userToUpdate.nickname} 吗？`)) {
      // Simulate API call (can be replaced with actual async logic)
      setTimeout(() => { 
        updateUserStatus(userToUpdate.openid, { isBanned: !userToUpdate.isBanned });
        showSuccess(`用户已${userToUpdate.isBanned ? '解封' : '封禁'}`);
      }, 500);
    }
  };

  const handleChangeRole = (userToUpdate: User, newRole: 'admin' | 'user') => {
    if (userToUpdate.openid === currentUser?.openid && newRole === 'user') {
      showWarning('不能将当前登录的管理员降级为普通用户');
      return;
    }
    if (window.confirm(`确定要将用户 ${userToUpdate.nickname} 的角色更改为 ${newRole === 'admin' ? '管理员' : '普通用户'} 吗？`)) {
      // Simulate API call
      setTimeout(() => {
        updateUserStatus(userToUpdate.openid, { role: newRole });
        showSuccess('用户角色已更新');
      }, 500);
    }
  };

  // style={{ marginTop: '20px' }} & h3 removed as parent AdminDashboardPage handles section card & title
  return (
    <div className="user-management">
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">{allUsers.length} 个用户</p>
        </div>
        {allUsers.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">暂无用户</p>
        ) : (
        <ul className="divide-y divide-gray-200">
          {allUsers.map((user: User) => (
            <li key={user.openid} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nickname || 'U')}&background=random`}
                    alt={user.nickname || 'User Avatar'}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.nickname}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      注册于: {dayjs(user.createdAt).format('YYYY-MM-DD')} | OpenID: {user.openid.slice(0,10)}...
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {user.isBanned && 
                    <span className="px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">已封禁</span>
                  }
                  {user.role === 'admin' && !user.isBanned &&
                    <span className="px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">管理员</span>
                  }
                  <CustomPopoverMenu
                    actions={[
                        { text: user.isBanned ? '解封用户' : '封禁用户', key: 'ban', icon: user.isBanned ? <CheckIcon className="w-4 h-4"/> : <BanIcon className="w-4 h-4"/> },
                        { text: '设为管理员', key: 'makeAdmin', disabled: user.role === 'admin' },
                        { text: '设为普通用户', key: 'makeUser', disabled: user.role === 'user' || user.openid === currentUser?.openid }, // Prevent demoting self
                    ]}
                    onAction={(key) => {
                        if (key === 'ban') handleToggleBan(user);
                        if (key === 'makeAdmin') handleChangeRole(user, 'admin');
                        if (key === 'makeUser') handleChangeRole(user, 'user');
                    }}
                    trigger={
                      <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 transition-colors">
                        <EditIcon className="w-4 h-4 mr-1" /> 操作
                      </button>
                    }
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 