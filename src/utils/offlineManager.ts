import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { notificationManager } from './notifications';

// Database schema for offline storage
interface ClimberDB extends DBSchema {
  activities: {
    key: string;
    value: {
      id: string;
      data: any;
      lastModified: Date;
      syncStatus: 'synced' | 'pending' | 'conflict';
    };
  };
  users: {
    key: string;
    value: {
      id: string;
      data: any;
      lastModified: Date;
      syncStatus: 'synced' | 'pending' | 'conflict';
    };
  };
  comments: {
    key: string;
    value: {
      id: string;
      activityId: string;
      data: any;
      lastModified: Date;
      syncStatus: 'synced' | 'pending' | 'conflict';
    };
  };
  reviews: {
    key: string;
    value: {
      id: string;
      activityId: string;
      data: any;
      lastModified: Date;
      syncStatus: 'synced' | 'pending' | 'conflict';
    };
  };
  syncQueue: {
    key: number;
    value: {
      id: number;
      type: 'create' | 'update' | 'delete';
      entity: 'activity' | 'user' | 'comment' | 'review';
      entityId: string;
      data: any;
      timestamp: Date;
      retries: number;
      maxRetries: number;
      status: 'pending' | 'processing' | 'completed' | 'failed';
    };
    indexes: { 'by-status': string; 'by-entity': string };
  };
}

export interface OfflineData {
  activities: Map<string, any>;
  users: Map<string, any>;
  comments: Map<string, any>;
  reviews: Map<string, any>;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingOperations: number;
  failedOperations: number;
  syncInProgress: boolean;
}

// Define SyncOperation interface (commented out as not currently used)
// interface SyncOperation {
//   id: number;
//   type: 'create' | 'update' | 'delete';
//   entity: 'activity' | 'user' | 'comment' | 'review';
//   entityId: string;
//   data: any;
//   timestamp: Date;
//   retries: number;
//   maxRetries: number;
//   status: 'pending' | 'completed' | 'failed';
// }

class OfflineManager {
  private db: IDBPDatabase<ClimberDB> | null = null;
  private syncInProgress = false;
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private dataChangeListeners: Set<(data: OfflineData) => void> = new Set();
  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupNetworkHandlers();
    this.initDatabase();
  }

  /**
   * Initialize IndexedDB database
   */
  private async initDatabase(): Promise<void> {
    try {
      this.db = await openDB<ClimberDB>('climber-daz-offline', 1, {
        upgrade(db) {
          // Activities store
          db.createObjectStore('activities', { keyPath: 'id' });

          // Users store
          db.createObjectStore('users', { keyPath: 'id' });

          // Comments store
          db.createObjectStore('comments', { keyPath: 'id' });

          // Reviews store
          db.createObjectStore('reviews', { keyPath: 'id' });

          // Sync queue store
          const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncQueueStore.createIndex('by-status', 'status');
          syncQueueStore.createIndex('by-entity', 'entity');
        },
      });

      console.log('[Offline] Database initialized successfully');
      
      // Start sync process if online
      if (this.isOnline) {
        this.startSyncProcess();
      }
    } catch (error) {
      console.error('[Offline] Failed to initialize database:', error);
    }
  }

  /**
   * Setup network status handlers
   */
  private setupNetworkHandlers(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('[Offline] Network online');
    this.isOnline = true;
    
    notificationManager.show({
      type: 'success',
      title: '网络已连接',
      message: '正在同步数据...',
      duration: 3000
    });

    this.startSyncProcess();
    this.notifySyncListeners();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('[Offline] Network offline');
    this.isOnline = false;
    
    notificationManager.show({
      type: 'warning',
      title: '网络已断开',
      message: '应用将以离线模式运行',
      duration: 4000
    });

    this.stopSyncProcess();
    this.notifySyncListeners();
  }

  /**
   * Start automatic sync process
   */
  private startSyncProcess(): void {
    if (!this.isOnline || this.syncInterval) return;

    // Initial sync
    this.syncData();

    // Setup periodic sync every 30 seconds
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncData();
      }
    }, 30000);
  }

  /**
   * Stop automatic sync process
   */
  private stopSyncProcess(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Store data locally for offline access
   */
  async storeData(
    entity: 'activities' | 'users' | 'comments' | 'reviews',
    data: any,
    syncStatus: 'synced' | 'pending' = 'synced'
  ): Promise<void> {
    if (!this.db) return;

    try {
      const storeData = {
        id: data.id,
        data,
        lastModified: new Date(),
        syncStatus,
        ...(entity === 'comments' || entity === 'reviews' ? { activityId: data.activityId } : {})
      };

      await this.db.put(entity, storeData);
      this.notifyDataChangeListeners();
    } catch (error) {
      console.error(`[Offline] Failed to store ${entity}:`, error);
    }
  }

  /**
   * Get data from local storage
   */
  async getData(
    entity: 'activities' | 'users' | 'comments' | 'reviews',
    id?: string
  ): Promise<any> {
    if (!this.db) return null;

    try {
      if (id) {
        const result = await this.db.get(entity, id);
        return result?.data || null;
      } else {
        const results = await this.db.getAll(entity);
        return results.map(item => item.data);
      }
    } catch (error) {
      console.error(`[Offline] Failed to get ${entity}:`, error);
      return null;
    }
  }

  /**
   * Queue operation for sync when online
   */
  async queueOperation(
    type: 'create' | 'update' | 'delete',
    entity: 'activity' | 'user' | 'comment' | 'review',
    entityId: string,
    data: any
  ): Promise<void> {
    if (!this.db) return;

    try {
      const operation = {
        type,
        entity,
        entityId,
        data,
        timestamp: new Date(),
        retries: 0,
        maxRetries: 3,
        status: 'pending' as const
      };

      await this.db.add('syncQueue', { ...operation, id: Date.now() } as any);
      console.log(`[Offline] Queued ${type} operation for ${entity}:${entityId}`);

      // If online, try to sync immediately
      if (this.isOnline) {
        this.syncData();
      }

      this.notifySyncListeners();
    } catch (error) {
      console.error('[Offline] Failed to queue operation:', error);
    }
  }

  /**
   * Sync queued operations with server
   */
  async syncData(): Promise<void> {
    if (!this.db || !this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    this.notifySyncListeners();

    try {
      // Get all pending operations
      const operations = await this.db.getAllFromIndex('syncQueue', 'by-status', 'pending');
      
      console.log(`[Offline] Syncing ${operations.length} pending operations`);

      for (const operation of operations) {
        await this.syncOperation(operation);
      }

      // Clean up completed operations
      await this.cleanupCompletedOperations();

    } catch (error) {
      console.error('[Offline] Sync failed:', error);
    } finally {
      this.syncInProgress = false;
      this.notifySyncListeners();
    }
  }

  /**
   * Sync individual operation
   */
  private async syncOperation(operation: any): Promise<void> {
    if (!this.db) return;

    try {
      // Update status to processing
      operation.status = 'processing';
      await this.db.put('syncQueue', operation);

      // Simulate API call - replace with actual API calls
      const apiEndpoint = this.getApiEndpoint(operation.entity);
      let response: Response;

      switch (operation.type) {
        case 'create':
          response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(operation.data)
          });
          break;

        case 'update':
          response = await fetch(`${apiEndpoint}/${operation.entityId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(operation.data)
          });
          break;

        case 'delete':
          response = await fetch(`${apiEndpoint}/${operation.entityId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          });
          break;

        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      if (response.ok) {
        // Mark as completed
        operation.status = 'completed';
        await this.db.put('syncQueue', operation);

        // Update local data sync status
        if (operation.type !== 'delete') {
          const entity = `${operation.entity}s` as keyof ClimberDB;
          const localData = await this.db.get(entity as any, operation.entityId);
          if (localData && 'syncStatus' in localData) {
            (localData as any).syncStatus = 'synced';
            await this.db.put(entity as any, localData);
          }
        } else {
          // Remove from local storage if deleted
          const entity = `${operation.entity}s` as keyof ClimberDB;
          await this.db.delete(entity as any, operation.entityId);
        }

        console.log(`[Offline] Successfully synced ${operation.type} for ${operation.entity}:${operation.entityId}`);
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

    } catch (error) {
      console.error(`[Offline] Failed to sync operation:`, error);
      
      // Increment retry count
      operation.retries++;
      
      if (operation.retries >= operation.maxRetries) {
        operation.status = 'failed';
        notificationManager.show({
          type: 'error',
          title: '同步失败',
          message: `${operation.entity} 数据同步失败，请检查网络连接`,
          duration: 5000
        });
      } else {
        operation.status = 'pending';
      }
      
      await this.db.put('syncQueue', operation);
    }
  }

  /**
   * Get API endpoint for entity
   */
  private getApiEndpoint(entity: string): string {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
    const endpoints = {
      activity: `${baseUrl}/activities`,
      user: `${baseUrl}/users`,
      comment: `${baseUrl}/comments`,
      review: `${baseUrl}/reviews`
    };
    return endpoints[entity as keyof typeof endpoints] || baseUrl;
  }

  /**
   * Clean up completed operations
   */
  private async cleanupCompletedOperations(): Promise<void> {
    if (!this.db) return;

    try {
      const completedOps = await this.db.getAllFromIndex('syncQueue', 'by-status', 'completed');
      const oldCompletedOps = completedOps.filter(
        op => Date.now() - op.timestamp.getTime() > 24 * 60 * 60 * 1000 // 24 hours
      );

      for (const op of oldCompletedOps) {
        await this.db.delete('syncQueue', op.id);
      }

      if (oldCompletedOps.length > 0) {
        console.log(`[Offline] Cleaned up ${oldCompletedOps.length} old completed operations`);
      }
    } catch (error) {
      console.error('[Offline] Failed to cleanup completed operations:', error);
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    if (!this.db) {
      return {
        isOnline: this.isOnline,
        lastSyncTime: null,
        pendingOperations: 0,
        failedOperations: 0,
        syncInProgress: this.syncInProgress
      };
    }

    try {
      const pendingOps = await this.db.getAllFromIndex('syncQueue', 'by-status', 'pending');
      const failedOps = await this.db.getAllFromIndex('syncQueue', 'by-status', 'failed');
      const lastSyncTime = localStorage.getItem('last_sync_time');

      return {
        isOnline: this.isOnline,
        lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : null,
        pendingOperations: pendingOps.length,
        failedOperations: failedOps.length,
        syncInProgress: this.syncInProgress
      };
    } catch (error) {
      console.error('[Offline] Failed to get sync status:', error);
      return {
        isOnline: this.isOnline,
        lastSyncTime: null,
        pendingOperations: 0,
        failedOperations: 0,
        syncInProgress: this.syncInProgress
      };
    }
  }

  /**
   * Subscribe to sync status changes
   */
  subscribeSyncStatus(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(callback);
    
    // Immediately call with current status
    this.getSyncStatus().then(callback);

    return () => {
      this.syncListeners.delete(callback);
    };
  }

  /**
   * Subscribe to data changes
   */
  subscribeDataChanges(callback: (data: OfflineData) => void): () => void {
    this.dataChangeListeners.add(callback);

    return () => {
      this.dataChangeListeners.delete(callback);
    };
  }

  /**
   * Notify sync listeners
   */
  private async notifySyncListeners(): Promise<void> {
    const status = await this.getSyncStatus();
    this.syncListeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('[Offline] Error in sync listener:', error);
      }
    });
  }

  /**
   * Notify data change listeners
   */
  private async notifyDataChangeListeners(): Promise<void> {
    try {
      const data: OfflineData = {
        activities: new Map(Object.entries(await this.getData('activities') || {})),
        users: new Map(Object.entries(await this.getData('users') || {})),
        comments: new Map(Object.entries(await this.getData('comments') || {})),
        reviews: new Map(Object.entries(await this.getData('reviews') || {}))
      };

      this.dataChangeListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[Offline] Error in data change listener:', error);
        }
      });
    } catch (error) {
      console.error('[Offline] Failed to notify data change listeners:', error);
    }
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<void> {
    if (!this.isOnline) {
      notificationManager.show({
        type: 'warning',
        title: '网络未连接',
        message: '请检查网络连接后重试',
        duration: 3000
      });
      return;
    }

    await this.syncData();
    
    notificationManager.show({
      type: 'success',
      title: '同步完成',
      message: '数据已同步到最新状态',
      duration: 3000
    });
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    try {
      const stores: (keyof ClimberDB)[] = ['activities', 'users', 'comments', 'reviews', 'syncQueue'];
      
      for (const storeName of stores) {
        const store = this.db.transaction(storeName as any, 'readwrite').objectStore(storeName as any);
        await store.clear();
      }

      console.log('[Offline] All offline data cleared');
      
      notificationManager.show({
        type: 'success',
        title: '离线数据已清除',
        message: '本地缓存已清空',
        duration: 3000
      });

      this.notifyDataChangeListeners();
    } catch (error) {
      console.error('[Offline] Failed to clear offline data:', error);
    }
  }

  /**
   * Get storage size information
   */
  async getStorageInfo(): Promise<{ used: number; quota: number; percentage: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;

        return { used, quota, percentage };
      }
    } catch (error) {
      console.error('[Offline] Failed to get storage info:', error);
    }

    return { used: 0, quota: 0, percentage: 0 };
  }

  // private async addToSyncQueue(_operation: Omit<SyncOperation, 'id'>): Promise<void> {
  //   const operationWithId: SyncOperation = {
  //     ..._operation,
  //     id: Date.now() + Math.random() // Simple ID generation
  //   };
  //   if (this.db) {
  //     await this.db.add('syncQueue', operationWithId);
  //   }
  // }

  async processSync(): Promise<void> {
    if (!this.db) {
      console.warn('Database not initialized');
      return;
    }

    try {
      const operations = await this.db.getAll('syncQueue');
      
      for (const operation of operations) {
        try {
          await this.syncOperation(operation);
          
          // Assume success for now since response is void
          // TODO: Fix return type of syncOperation to include success status
          // Update local data sync status
          const entityStore = operation.entity + 's' as keyof ClimberDB;
          const localData = await this.db.get(entityStore as any, operation.entityId);
          if (localData && 'syncStatus' in localData) {
            (localData as any).syncStatus = 'synced';
            await this.db.put(entityStore as any, localData);
          }
          
          // Remove from sync queue on success
          await this.db.delete('syncQueue', operation.id);
          
        } catch (error) {
          console.error('Sync operation failed:', error);
          operation.retries++;
          
          if (operation.retries >= operation.maxRetries) {
            operation.status = 'failed';
          }
          
          await this.db.put('syncQueue', operation);
        }
      }
    } catch (error) {
      console.error('Sync process failed:', error);
    }
  }

  async clearStore(storeName: keyof ClimberDB): Promise<void> {
    if (!this.db) return;
    
    try {
      const store = this.db.transaction(storeName as any, 'readwrite').objectStore(storeName as any);
      await store.clear();
    } catch (error) {
      console.error(`Failed to clear store ${storeName}:`, error);
    }
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager();

// React hook for offline functionality
export const useOffline = () => {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingOperations: 0,
    failedOperations: 0,
    syncInProgress: false
  });

  const [offlineData, setOfflineData] = React.useState<OfflineData>({
    activities: new Map(),
    users: new Map(),
    comments: new Map(),
    reviews: new Map()
  });

  React.useEffect(() => {
    const unsubscribeSync = offlineManager.subscribeSyncStatus(setSyncStatus);
    const unsubscribeData = offlineManager.subscribeDataChanges(setOfflineData);

    return () => {
      unsubscribeSync();
      unsubscribeData();
    };
  }, []);

  return {
    syncStatus,
    offlineData,
    storeData: offlineManager.storeData.bind(offlineManager),
    getData: offlineManager.getData.bind(offlineManager),
    queueOperation: offlineManager.queueOperation.bind(offlineManager),
    forceSyncNow: offlineManager.forceSyncNow.bind(offlineManager),
    clearOfflineData: offlineManager.clearOfflineData.bind(offlineManager),
    getStorageInfo: offlineManager.getStorageInfo.bind(offlineManager)
  };
};

// React imports for hook
import React from 'react'; 