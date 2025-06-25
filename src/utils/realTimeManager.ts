import { io, Socket } from 'socket.io-client';
import { notificationManager } from './notifications';

export interface RealTimeEvent {
  type: 'activity_update' | 'new_participant' | 'participant_left' | 'new_comment' | 'review_reminder' | 'activity_completed';
  data: any;
  timestamp: Date;
  userId?: string;
  activityId?: string;
}

export interface ActivityUpdate {
  activityId: string;
  type: 'participant_joined' | 'participant_left' | 'activity_updated' | 'activity_completed' | 'activity_cancelled';
  participant?: {
    id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  timestamp: Date;
}

export interface ReviewReminder {
  activityId: string;
  targetUserId: string;
  targetUserName: string;
  activityTitle: string;
  deadline: Date;
}

class RealTimeManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.setupVisibilityHandlers();
  }

  /**
   * Initialize WebSocket connection
   */
  async connect(userId: string, token: string): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    this.currentUserId = userId;

    try {
      this.socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3002', {
        auth: {
          token,
          userId
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.setupSocketHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('[RealTime] Connected to server');
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('[RealTime] Connection error:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('[RealTime] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
      console.log('[RealTime] Disconnected from server');
    }
  }

  /**
   * Check if connected
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Join activity room for real-time updates
   */
  joinActivityRoom(activityId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_activity', { activityId });
      console.log(`[RealTime] Joined activity room: ${activityId}`);
    }
  }

  /**
   * Leave activity room
   */
  leaveActivityRoom(activityId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_activity', { activityId });
      console.log(`[RealTime] Left activity room: ${activityId}`);
    }
  }

  /**
   * Send activity update
   */
  sendActivityUpdate(activityId: string, update: Partial<ActivityUpdate>): void {
    if (this.socket?.connected) {
      this.socket.emit('activity_update', {
        activityId,
        ...update,
        timestamp: new Date()
      });
    }
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    this.eventListeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Emit event to listeners
   */
  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[RealTime] Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Setup socket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: new Date() });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('disconnected', { timestamp: new Date() });
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`[RealTime] Reconnected after ${attemptNumber} attempts`);
      this.emit('reconnected', { attempts: attemptNumber });
    });

    this.socket.on('reconnect_error', (error: Error) => {
      this.reconnectAttempts++;
      console.error(`[RealTime] Reconnection attempt ${this.reconnectAttempts} failed:`, error);
    });

    // Activity events
    this.socket.on('activity_update', (data: ActivityUpdate) => {
      console.log('[RealTime] Activity update received:', data);
      this.handleActivityUpdate(data);
      this.emit('activity_update', data);
    });

    this.socket.on('participant_joined', (data: ActivityUpdate) => {
      console.log('[RealTime] Participant joined:', data);
      this.handleParticipantJoined(data);
      this.emit('participant_joined', data);
    });

    this.socket.on('participant_left', (data: ActivityUpdate) => {
      console.log('[RealTime] Participant left:', data);
      this.handleParticipantLeft(data);
      this.emit('participant_left', data);
    });

    this.socket.on('new_comment', (data: any) => {
      console.log('[RealTime] New comment:', data);
      this.handleNewComment(data);
      this.emit('new_comment', data);
    });

    this.socket.on('review_reminder', (data: ReviewReminder) => {
      console.log('[RealTime] Review reminder:', data);
      this.handleReviewReminder(data);
      this.emit('review_reminder', data);
    });

    this.socket.on('activity_completed', (data: ActivityUpdate) => {
      console.log('[RealTime] Activity completed:', data);
      this.handleActivityCompleted(data);
      this.emit('activity_completed', data);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('[RealTime] Socket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Handle activity update notifications
   */
  private handleActivityUpdate(data: ActivityUpdate): void {
    const { activityId, message } = data;
    
    // Show toast notification
    notificationManager.show({
      type: 'info',
      title: '活动更新',
      message,
      duration: 5000,
      actions: [
        {
          label: '查看',
          action: () => {
            window.location.href = `/activity/${activityId}`;
          }
        }
      ]
    });
  }

  /**
   * Handle participant joined notification
   */
  private handleParticipantJoined(data: ActivityUpdate): void {
    const { participant, activityId } = data;
    
    if (participant) {
      notificationManager.show({
        type: 'success',
        title: '新成员加入',
        message: `${participant.name} 加入了活动`,
        duration: 4000,
        actions: [
          {
            label: '查看活动',
            action: () => {
              window.location.href = `/activity/${activityId}`;
            }
          }
        ]
      });
    }
  }

  /**
   * Handle participant left notification
   */
  private handleParticipantLeft(data: ActivityUpdate): void {
    const { participant } = data;
    
    if (participant) {
      notificationManager.show({
        type: 'warning',
        title: '成员退出',
        message: `${participant.name} 退出了活动`,
        duration: 4000
      });
    }
  }

  /**
   * Handle new comment notification
   */
  private handleNewComment(data: any): void {
    const { activityId, author, content } = data;
    
    notificationManager.show({
      type: 'info',
      title: '新留言',
      message: `${author.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      duration: 4000,
      actions: [
        {
          label: '回复',
          action: () => {
            window.location.href = `/activity/${activityId}#comments`;
          }
        }
      ]
    });
  }

  /**
   * Handle review reminder notification
   */
  private handleReviewReminder(data: ReviewReminder): void {
    const { activityId, targetUserName, activityTitle } = data;
    
    notificationManager.show({
      type: 'warning',
      title: '评价提醒',
      message: `请评价 ${targetUserName} 在「${activityTitle}」中的表现`,
      duration: 8000,
      actions: [
        {
          label: '去评价',
          action: () => {
            window.location.href = `/review/${activityId}/${data.targetUserId}`;
          }
        },
        {
          label: '稍后提醒',
          action: () => {
            // Schedule another reminder in 1 hour
            setTimeout(() => {
              this.handleReviewReminder(data);
            }, 60 * 60 * 1000);
          }
        }
      ]
    });
  }

  /**
   * Handle activity completed notification
   */
  private handleActivityCompleted(data: ActivityUpdate): void {
    const { activityId, message } = data;
    
    notificationManager.show({
      type: 'success',
      title: '活动完成',
      message,
      duration: 6000,
      actions: [
        {
          label: '查看详情',
          action: () => {
            window.location.href = `/activity/${activityId}`;
          }
        }
      ]
    });
  }

  /**
   * Setup visibility change handlers to manage connection
   */
  private setupVisibilityHandlers(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Page is hidden, can reduce connection frequency
          console.log('[RealTime] Page hidden, reducing activity');
        } else {
          // Page is visible, ensure connection is active
          console.log('[RealTime] Page visible, ensuring connection');
          if (!this.isConnected && this.currentUserId) {
            // Attempt to reconnect if not connected
            this.attemptReconnect();
          }
        }
      });
    }

    // Handle online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[RealTime] Network online, attempting to reconnect');
        if (!this.isConnected && this.currentUserId) {
          this.attemptReconnect();
        }
      });

      window.addEventListener('offline', () => {
        console.log('[RealTime] Network offline');
        this.emit('network_offline', { timestamp: new Date() });
      });
    }
  }

  /**
   * Attempt to reconnect to the server
   */
  private async attemptReconnect(): Promise<void> {
    if (!this.currentUserId || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    try {
      // Get fresh token from storage or auth service
      const token = localStorage.getItem('auth_token');
      if (token) {
        await this.connect(this.currentUserId, token);
      }
    } catch (error) {
      console.error('[RealTime] Reconnection failed:', error);
    }
  }

  /**
   * Send typing indicator for activity comments
   */
  sendTypingIndicator(activityId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        activityId,
        isTyping,
        timestamp: new Date()
      });
    }
  }

  /**
   * Send user status update
   */
  updateUserStatus(status: 'online' | 'away' | 'offline'): void {
    if (this.socket?.connected) {
      this.socket.emit('user_status', {
        status,
        timestamp: new Date()
      });
    }
  }
}

// Create singleton instance
export const realTimeManager = new RealTimeManager();

// React hook for using real-time functionality
export const useRealTime = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const unsubscribeConnected = realTimeManager.subscribe('connected', () => {
      setIsConnected(true);
    });

    const unsubscribeDisconnected = realTimeManager.subscribe('disconnected', () => {
      setIsConnected(false);
    });

    const unsubscribeUpdate = realTimeManager.subscribe('activity_update', () => {
      setLastUpdate(new Date());
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeUpdate();
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    connect: realTimeManager.connect.bind(realTimeManager),
    disconnect: realTimeManager.disconnect.bind(realTimeManager),
    joinActivityRoom: realTimeManager.joinActivityRoom.bind(realTimeManager),
    leaveActivityRoom: realTimeManager.leaveActivityRoom.bind(realTimeManager),
    subscribe: realTimeManager.subscribe.bind(realTimeManager),
    sendTypingIndicator: realTimeManager.sendTypingIndicator.bind(realTimeManager),
    updateUserStatus: realTimeManager.updateUserStatus.bind(realTimeManager)
  };
};

// React imports for hook
import React from 'react'; 