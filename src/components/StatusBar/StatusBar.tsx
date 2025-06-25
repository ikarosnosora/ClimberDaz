import React, { useState, useEffect } from 'react';
import { useRealTime } from '../../utils/realTimeManager';
import { useOffline } from '../../utils/offlineManager';
import './StatusBar.css';

interface StatusBarProps {
  className?: string;
  minimal?: boolean;
  showDetails?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({
  className = '',
  minimal = false,
  showDetails = false
}) => {
  const { isConnected: isRealTimeConnected } = useRealTime();
  const { syncStatus, forceSyncNow, getStorageInfo } = useOffline();
  const [expanded, setExpanded] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, quota: 0, percentage: 0 });

  useEffect(() => {
    // Load storage info periodically
    const loadStorageInfo = async () => {
      const info = await getStorageInfo();
      setStorageInfo(info);
    };

    loadStorageInfo();
    const interval = setInterval(loadStorageInfo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [getStorageInfo]);

  const getConnectionStatus = () => {
    if (!syncStatus.isOnline) {
      return {
        status: 'offline',
        label: '离线模式',
        color: 'bg-gray-500',
        icon: '📴',
        description: '网络未连接，使用本地数据'
      };
    }

    if (!isRealTimeConnected) {
      return {
        status: 'connecting',
        label: '连接中',
        color: 'bg-yellow-500',
        icon: '🔄',
        description: '正在连接服务器'
      };
    }

    if (syncStatus.syncInProgress) {
      return {
        status: 'syncing',
        label: '同步中',
        color: 'bg-blue-500',
        icon: '⬆️',
        description: '正在同步数据'
      };
    }

    if (syncStatus.failedOperations > 0) {
      return {
        status: 'error',
        label: '同步失败',
        color: 'bg-red-500',
        icon: '⚠️',
        description: `${syncStatus.failedOperations} 个操作同步失败`
      };
    }

    if (syncStatus.pendingOperations > 0) {
      return {
        status: 'pending',
        label: '待同步',
        color: 'bg-orange-500',
        icon: '⏳',
        description: `${syncStatus.pendingOperations} 个操作待同步`
      };
    }

    return {
      status: 'online',
      label: '已连接',
      color: 'bg-green-500',
      icon: '✅',
      description: '实时连接正常'
    };
  };

  const handleSyncNow = async () => {
    try {
      await forceSyncNow();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatLastSync = (lastSyncTime: Date | null): string => {
    if (!lastSyncTime) return '从未同步';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  const connectionStatus = getConnectionStatus();

  if (minimal) {
    return (
      <div className={`status-bar-minimal ${className}`}>
        <div className={`status-indicator ${connectionStatus.color}`}>
          <span className="status-icon">{connectionStatus.icon}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`status-bar ${className} ${expanded ? 'expanded' : ''}`}>
      {/* Main Status Display */}
      <div 
        className="status-bar-main"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div className="status-content">
          <div className={`status-indicator ${connectionStatus.color}`}>
            <span className="status-icon">{connectionStatus.icon}</span>
          </div>
          
          <div className="status-text">
            <span className="status-label">{connectionStatus.label}</span>
            {showDetails && (
              <span className="status-description">{connectionStatus.description}</span>
            )}
          </div>

          {/* Sync Progress */}
          {syncStatus.syncInProgress && (
            <div className="sync-progress">
              <div className="sync-spinner"></div>
            </div>
          )}

          {/* Pending Operations Badge */}
          {syncStatus.pendingOperations > 0 && (
            <div className="pending-badge">
              {syncStatus.pendingOperations}
            </div>
          )}
        </div>

        {/* Expand Arrow */}
        <div className={`expand-arrow ${expanded ? 'rotated' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="status-bar-details">
          {/* Connection Details */}
          <div className="detail-section">
            <h4 className="detail-title">连接状态</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">网络:</span>
                <span className={`detail-value ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {syncStatus.isOnline ? '已连接' : '离线'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">实时连接:</span>
                <span className={`detail-value ${isRealTimeConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isRealTimeConnected ? '已连接' : '未连接'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">上次同步:</span>
                <span className="detail-value">
                  {formatLastSync(syncStatus.lastSyncTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          {(syncStatus.pendingOperations > 0 || syncStatus.failedOperations > 0) && (
            <div className="detail-section">
              <h4 className="detail-title">同步状态</h4>
              <div className="detail-grid">
                {syncStatus.pendingOperations > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">待同步:</span>
                    <span className="detail-value text-orange-600">
                      {syncStatus.pendingOperations} 个操作
                    </span>
                  </div>
                )}
                {syncStatus.failedOperations > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">失败:</span>
                    <span className="detail-value text-red-600">
                      {syncStatus.failedOperations} 个操作
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Storage Info */}
          <div className="detail-section">
            <h4 className="detail-title">存储使用</h4>
            <div className="storage-info">
              <div className="storage-bar">
                <div 
                  className="storage-fill"
                  style={{ 
                    width: `${Math.min(storageInfo.percentage, 100)}%`,
                    backgroundColor: storageInfo.percentage > 80 ? '#ef4444' : 
                                   storageInfo.percentage > 60 ? '#f59e0b' : '#10b981'
                  }}
                ></div>
              </div>
              <div className="storage-text">
                <span>{formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}</span>
                <span className="storage-percentage">
                  ({storageInfo.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="detail-actions">
            <button
              onClick={handleSyncNow}
              disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
              className="action-button sync-button"
            >
              {syncStatus.syncInProgress ? (
                <>
                  <div className="button-spinner"></div>
                  同步中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  立即同步
                </>
              )}
            </button>

            <button
              onClick={() => setExpanded(false)}
              className="action-button close-button"
            >
              收起
            </button>
          </div>

          {/* Network Status Tips */}
          {!syncStatus.isOnline && (
            <div className="status-tip offline-tip">
              <div className="tip-icon">💡</div>
              <div className="tip-content">
                <p className="tip-title">离线模式</p>
                <p className="tip-description">
                  您的操作将保存在本地，网络恢复后自动同步
                </p>
              </div>
            </div>
          )}

          {syncStatus.failedOperations > 0 && (
            <div className="status-tip error-tip">
              <div className="tip-icon">⚠️</div>
              <div className="tip-content">
                <p className="tip-title">同步失败</p>
                <p className="tip-description">
                  部分数据同步失败，请检查网络连接或稍后重试
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusBar; 