export enum EventType {
  PAGE_VIEW = 'page_view',
  USER_ACTION = 'user_action',
  ACTIVITY_CREATE = 'activity_create',
  ACTIVITY_JOIN = 'activity_join',
  ACTIVITY_LEAVE = 'activity_leave',
  ACTIVITY_VIEW = 'activity_view',
  SEARCH = 'search',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  REVIEW_CREATE = 'review_create',
  REVIEW_VIEW = 'review_view',
  GYM_VIEW = 'gym_view',
  NOTIFICATION_VIEW = 'notification_view',
}

export interface AnalyticsEvent {
  id?: string;
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
  createdAt?: Date;
}

export interface UserSession {
  id?: string;
  sessionId: string;
  userId?: string;
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  eventCount: number;
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: {
    platform?: string;
    browser?: string;
    version?: string;
    screenResolution?: string;
    language?: string;
    isMobile?: boolean;
  };
  geoLocation?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
    timezone?: string;
  };
  entryPage?: string;
  exitPage?: string;
  referrer?: string;
  updatedAt?: Date;
}

export interface AnalyticsStats {
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    period: string;
  };
  eventTypeStats: Array<{
    eventType: string;
    count: number;
  }>;
  timeSeriesData: Array<{
    time: string;
    count: number;
  }>;
}

export interface UserBehaviorAnalysis {
  userActivity: Array<{
    userId: string;
    eventCount: number;
    activeDays: number;
    firstActivity: Date;
    lastActivity: Date;
  }>;
  pageFlowAnalysis: Array<{
    pagePath: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  period: string;
}

export interface DashboardData {
  weeklyStats: AnalyticsStats;
  userBehavior: UserBehaviorAnalysis;
  todayStats: AnalyticsStats;
  lastUpdated: Date;
}

export interface AnalyticsQuery {
  eventType?: EventType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  pagePath?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AnalyticsResponse<T = any> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface RealTimeMetrics {
  onlineUsers: number;
  activeConnections: number;
  responseTime: number;
  serverLoad: number;
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  timestamp: Date;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceMetric {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  activeUsers: number;
  errorCount: number;
}