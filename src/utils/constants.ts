import dayjs from 'dayjs';

export { dayjs };

/**
 * Centralized constants to eliminate redundancy
 * Single source of truth for all application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.climberdaz.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  INITIAL_PAGE: 1,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  AVATAR_SIZE: {
    SMALL: 28,
    MEDIUM: 40,
    LARGE: 64,
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'climberdaz_token',
  USER_PREFERENCES: 'climberdaz_preferences',
  ACTIVITY_FILTERS: 'climberdaz_activity_filters',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PROFILE: '/profile',
  ACTIVITY_DETAIL: '/activity/:id',
  CREATE_ACTIVITY: '/create-activity',
  ADMIN: '/admin',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查您的网络设置',
  UNAUTHORIZED: '登录已过期，请重新登录',
  FORBIDDEN: '您没有权限执行此操作',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器错误，请稍后重试',
  VALIDATION_ERROR: '输入数据不符合要求',
  ACTIVITY_FULL: '活动已满员',
  ALREADY_JOINED: '您已经参加了此活动',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出登录成功',
  PROFILE_UPDATED: '个人信息更新成功',
  ACTIVITY_CREATED: '活动发布成功',
  ACTIVITY_JOINED: '成功加入活动',
  ACTIVITY_LEFT: '成功退出活动',
  REVIEW_SUBMITTED: '评价提交成功',
} as const;

// Form Validation
export const VALIDATION_RULES = {
  NICKNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
  },
  ACTIVITY_TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 50,
  },
  ACTIVITY_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  COMMENT: {
    MAX_LENGTH: 200,
  },
} as const;

// Activity Configuration
export const ACTIVITY_CONFIG = {
  MAX_PARTICIPANTS: 20,
  MIN_PARTICIPANTS: 2,
  BOOKING_DEADLINE_HOURS: 2, // Hours before activity starts
  REVIEW_DEADLINE_DAYS: 7, // Days after activity ends
} as const; 