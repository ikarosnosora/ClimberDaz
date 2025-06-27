import { EventType } from '../types/analytics';

interface AnalyticsEvent {
  eventType: EventType;
  userId?: string;
  sessionId: string;
  pagePath?: string;
  properties?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  geoLocation?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };
  deviceInfo?: {
    platform?: string;
    browser?: string;
    version?: string;
    screenResolution?: string;
    language?: string;
  };
  referrer?: string;
  duration?: number;
}

interface QueuedEvent extends AnalyticsEvent {
  timestamp: number;
}

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private eventQueue: QueuedEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isOnline: boolean = navigator.onLine;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private maxRetries: number = 3;
  private apiEndpoint: string = '/api/analytics/events';
  private batchEndpoint: string = '/api/analytics/events/batch';
  private flushTimer?: NodeJS.Timeout;
  private pageStartTime: number = Date.now();
  private currentPage: string = window.location.pathname;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startPeriodicFlush();
    this.trackPageView();
  }

  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * 设置用户ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * 清除用户ID（用户登出时）
   */
  public clearUserId(): void {
    this.userId = undefined;
  }

  /**
   * 跟踪事件
   */
  public track(eventType: EventType, properties?: Record<string, any>): void {
    const event: QueuedEvent = {
      eventType,
      userId: this.userId,
      sessionId: this.sessionId,
      pagePath: window.location.pathname,
      properties,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      referrer: document.referrer,
      timestamp: Date.now(),
    };

    this.addToQueue(event);
  }

  /**
   * 跟踪页面浏览
   */
  public trackPageView(pagePath?: string): void {
    const path = pagePath || window.location.pathname;
    
    // 如果页面发生变化，记录上一页面的停留时间
    if (this.currentPage !== path) {
      const duration = Date.now() - this.pageStartTime;
      this.track(EventType.PAGE_VIEW, {
        previousPage: this.currentPage,
        duration,
      });
      
      this.currentPage = path;
      this.pageStartTime = Date.now();
    }

    this.track(EventType.PAGE_VIEW, {
      page: path,
      title: document.title,
      url: window.location.href,
    });
  }

  /**
   * 跟踪用户操作
   */
  public trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track(EventType.USER_ACTION, {
      action,
      ...properties,
    });
  }

  /**
   * 跟踪按钮点击
   */
  public trackButtonClick(buttonName: string, properties?: Record<string, any>): void {
    this.track(EventType.BUTTON_CLICK, {
      buttonName,
      ...properties,
    });
  }

  /**
   * 跟踪表单提交
   */
  public trackFormSubmit(formName: string, properties?: Record<string, any>): void {
    this.track(EventType.FORM_SUBMIT, {
      formName,
      ...properties,
    });
  }

  /**
   * 跟踪搜索
   */
  public trackSearch(query: string, results?: number, properties?: Record<string, any>): void {
    this.track(EventType.SEARCH, {
      query,
      results,
      ...properties,
    });
  }

  /**
   * 跟踪错误
   */
  public trackError(error: Error, properties?: Record<string, any>): void {
    this.track(EventType.ERROR, {
      errorMessage: error.message,
      errorStack: error.stack,
      ...properties,
    });
  }

  /**
   * 跟踪性能指标
   */
  public trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.track(EventType.PERFORMANCE, {
      metric,
      value,
      ...properties,
    });
  }

  /**
   * 跟踪活动相关操作
   */
  public trackActivityAction(action: 'create' | 'join' | 'leave' | 'view', activityId: string, properties?: Record<string, any>): void {
    let eventType: EventType;
    switch (action) {
      case 'create':
        eventType = EventType.ACTIVITY_CREATE;
        break;
      case 'join':
        eventType = EventType.ACTIVITY_JOIN;
        break;
      case 'leave':
        eventType = EventType.ACTIVITY_LEAVE;
        break;
      case 'view':
        eventType = EventType.ACTIVITY_VIEW;
        break;
    }

    this.track(eventType, {
      activityId,
      ...properties,
    });
  }

  /**
   * 立即发送所有排队的事件
   */
  public async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (events.length === 1) {
        await this.sendSingleEvent(events[0]);
      } else {
        await this.sendBatchEvents(events);
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // 重新加入队列，但限制重试次数
      const retriableEvents = events.filter(event => 
        !event.retryCount || event.retryCount < this.maxRetries
      ).map(event => ({
        ...event,
        retryCount: (event.retryCount || 0) + 1
      }));
      
      this.eventQueue.unshift(...retriableEvents);
    }
  }

  /**
   * 添加事件到队列
   */
  private addToQueue(event: QueuedEvent): void {
    this.eventQueue.push(event);

    // 如果在线且队列达到批量大小，立即发送
    if (this.isOnline && this.eventQueue.length >= this.batchSize) {
      this.flush();
    }

    // 保存到本地存储作为备份
    this.saveToLocalStorage();
  }

  /**
   * 发送单个事件
   */
  private async sendSingleEvent(event: QueuedEvent): Promise<void> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * 批量发送事件
   */
  private async sendBatchEvents(events: QueuedEvent[]): Promise<void> {
    const response = await fetch(this.batchEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取设备信息
   */
  private getDeviceInfo() {
    const ua = navigator.userAgent;
    return {
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      browser: this.getBrowserInfo(ua),
      version: this.getBrowserVersion(ua),
    };
  }

  /**
   * 获取浏览器信息
   */
  private getBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * 获取浏览器版本
   */
  private getBrowserVersion(userAgent: string): string {
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/([\d.]+)/);
    return match ? match[2] : 'Unknown';
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 在线状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.loadFromLocalStorage();
      this.flush();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 页面卸载时发送剩余事件
    window.addEventListener('beforeunload', () => {
      if (this.eventQueue.length > 0) {
        // 使用 sendBeacon API 确保事件能够发送
        const events = [...this.eventQueue];
        navigator.sendBeacon(
          this.batchEndpoint,
          JSON.stringify({ events })
        );
      }
    });

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏时记录停留时间
        const duration = Date.now() - this.pageStartTime;
        this.track(EventType.USER_ACTION, {
          action: 'page_hidden',
          duration,
        });
      } else {
        // 页面重新可见
        this.pageStartTime = Date.now();
        this.track(EventType.USER_ACTION, {
          action: 'page_visible',
        });
      }
    });

    // 自动跟踪错误
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // 自动跟踪未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
      });
    });
  }

  /**
   * 开始定期刷新
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.isOnline && this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  /**
   * 保存到本地存储
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('analytics_queue', JSON.stringify(this.eventQueue));
    } catch (error) {
      console.warn('Failed to save analytics queue to localStorage:', error);
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('analytics_queue');
      if (saved) {
        const events = JSON.parse(saved) as QueuedEvent[];
        this.eventQueue.unshift(...events);
        localStorage.removeItem('analytics_queue');
      }
    } catch (error) {
      console.warn('Failed to load analytics queue from localStorage:', error);
    }
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// 导出单例实例
export const analytics = AnalyticsManager.getInstance();
export default AnalyticsManager;