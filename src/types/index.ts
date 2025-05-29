import type { Notification } from '../components/Notifications/NotificationItem'; // Corrected import path

// User related types
export interface User {
  openid: string;
  nickname: string;
  avatar?: string;
  level?: number;
  gearTags: GearType[];
  createdAt: Date;
  updatedAt?: Date;
  climbingAge?: number;
  introduction?: string;
  city?: string;
  frequentlyVisitedGyms?: string[];
  climbingPreferences?: ActivityType[];
  notificationPreferences?: UserNotificationPreferences;
  isBanned?: boolean;
  role?: 'admin' | 'user';
}

// Activity related types
export interface Activity {
  id: string;
  hostId: string;
  title: string;
  datetime: Date;
  locationText: string;
  lat: number;
  lng: number;
  meetMode: MeetMode;
  isPrivate: boolean;
  types: ActivityType[];
  grades: string[];
  costMode: CostMode;
  slotMax: number;
  status: ActivityStatus;
  createdAt: Date;
  updatedAt?: Date;
  participantIds?: string[];
  participants?: User[];
  participantCount?: number;
  comments?: Comment[];
  reviews?: Review[];
  distance?: number;
  host?: User;
}

// Participation related types
export interface Participation {
  activityId: string;
  userId: string;
  joinTime: Date;
  user?: User;
  cancelTime?: Date | null;
}

// Comment related types
export interface Comment {
  id: string;
  activityId: string;
  userId: string;
  user?: User;
  content: string;
  timestamp: Date;
  parentCommentId?: string;
  replies?: Comment[];
}

// Review related types
export enum ReviewStatus {
  GOOD = 'GOOD',
  BAD = 'BAD',
  NO_SHOW = 'NO_SHOW',
}

export interface Review {
  id: string;
  activityId: string;
  fromUserOpenid: string;
  toUserOpenid: string;
  status: ReviewStatus;
  comment?: string;
  createdAt: Date;
  fromUserDetails?: User;
  toUserDetails?: User;
}

// Announcement related types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  startAt: Date;
  endAt: Date;
  weight: number;
  createdAt: Date;
}

// Enums
export enum MeetMode {
  MEET_AT_ENTRANCE = 'MEET_AT_ENTRANCE',
  FIRST_COME_FIRST_CLIMB = 'FIRST_COME_FIRST_CLIMB',
}

export enum ActivityStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CostMode {
  FREE = 'FREE',
  AA = 'AA',
  HOST_TREAT = 'HOST_TREAT',
}

export enum ActivityType {
  BOULDERING = 'BOULDERING',
  TOP_ROPE_AUTO_BELAY = 'TOP_ROPE_AUTO_BELAY',
  TOP_ROPE_MANUAL_BELAY = 'TOP_ROPE_MANUAL_BELAY',
  LEAD_CLIMBING = 'LEAD_CLIMBING',
  OUTDOOR = 'OUTDOOR',
  TRAINING = 'TRAINING',
}

export enum DifficultyGrade {
  // V-Scale
  V0_V2 = 'V0-V2',
  V3_V5 = 'V3-V5',
  V6_V7 = 'V6-V7',
  V8_PLUS = 'V8+',
  V_OPEN = 'V_OPEN', // Retained: V-Open (不限)

  // YDS
  YDS_5_5_5_8 = 'YDS_5.5-5.8',
  YDS_5_9_5_10D = 'YDS_5.9-5.10d',
  YDS_5_11A_5_11D = 'YDS_5.11a-5.11d',
  YDS_5_12A_5_12D = 'YDS_5.12a-5.12d',
  YDS_5_13_PLUS = 'YDS_5.13+',
  YDS_OPEN = 'YDS_OPEN', // Retained: YDS-Open (不限)
}

export enum GearType {
  SHOES = 'SHOES',
  HARNESS = 'HARNESS',
  ROPE = 'ROPE',
  QUICKDRAWS = 'QUICKDRAWS',
  CHALK = 'CHALK',
  BELAY_DEVICE = 'BELAY_DEVICE',
  HELMET = 'HELMET',
}

// Form types
export interface ActivityFormData {
  title: string;
  datetime: Date;
  locationText: string;
  lat?: number;
  lng?: number;
  meetMode: MeetMode;
  isPrivate: boolean;
  types: ActivityType[];
  grades: string[];
  costMode: CostMode;
  slotMax: number;
  description?: string;
}

export interface ReviewFormData {
  comment?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Filter types
export interface ActivityFilter {
  date?: Date;
  types?: ActivityType[];
  grades?: string[];
  distance?: number;
  showFull?: boolean;
}

// Types for Zustand store
export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

export interface ActivityState {
  activities: Activity[];
  currentActivity: Activity | null;
  isLoading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  addActivity: (activity: Activity) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  setCurrentActivity: (activity: Activity | null) => void;
}

export interface AppState {
  theme: 'light' | 'dark';
  notifications: Notification[]; // Changed from any[]
  toggleTheme: () => void;
  addNotification: (notification: Notification) => void; // Changed from any
}

export interface ClimberDazStore extends UserState, ActivityState, AppState {}

export interface UserNotificationPreferences {
  receiveNewCommentNotifications: boolean;
  receiveActivityJoinNotifications: boolean;
  receiveActivityUpdateNotifications: boolean;
  receiveSystemAnnouncements: boolean;
  // Add more as needed, e.g., new follower, event reminders
}

export const defaultNotificationPreferences: UserNotificationPreferences = {
  receiveNewCommentNotifications: true,
  receiveActivityJoinNotifications: true,
  receiveActivityUpdateNotifications: true,
  receiveSystemAnnouncements: true,
};

// Export common types
export * from './common'; 