import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  User, 
  Activity, 
  Announcement, 
  UserNotificationPreferences, 
  ActivityType, 
  GearType 
} from '../types';
import { defaultNotificationPreferences } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Optimized Store Architecture
 * - Combines functionality from both useStore and useApiStore
 * - Uses Immer for immutable updates
 * - Proper separation of concerns with slices
 * - Performance optimized with selectors
 */

// State Interfaces
export interface UserState {
  user: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ActivityState {
  activities: Activity[];
  currentActivity: Activity | null;
  totalActivities: number;
  isLoadingActivities: boolean;
  searchText: string;
  selectedTypes: string[];
  selectedGrades: string[];
}

interface AppState {
  announcements: Announcement[];
  isLoadingAnnouncements: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

// Action Interfaces
interface UserActions {
  // Authentication
  setUser: (user: User | null) => void;
  logout: () => void;
  
  // User Management
  setAllUsers: (users: User[]) => void;
  updateUserStatus: (userId: string, updates: Partial<Pick<User, 'isBanned' | 'role'>>) => void;
  updateUserNotificationPreferences: (preferences: Partial<UserNotificationPreferences>) => void;
  updateUserProfile: (profileData: Partial<User>) => void;
  
  // Loading states
  setUserLoading: (loading: boolean) => void;
}

interface ActivityActions {
  // Activity CRUD
  setActivities: (activities: Activity[]) => void;
  setCurrentActivity: (activity: Activity | null) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
  
  // Filter Management
  setSearchText: (text: string) => void;
  setSelectedTypes: (types: string[]) => void;
  setSelectedGrades: (grades: string[]) => void;
  resetFilters: () => void;
  
  // Loading states
  setActivityLoading: (loading: boolean) => void;
}

interface AppActions {
  // App state
  setAnnouncements: (announcements: Announcement[]) => void;
  setError: (error: string | null) => void;
  toggleTheme: () => void;
  setAnnouncementLoading: (loading: boolean) => void;
}

// Combined Store Interface
export interface OptimizedStore extends 
  UserState, 
  ActivityState, 
  AppState, 
  UserActions, 
  ActivityActions, 
  AppActions {}

// Mock data (centralized)
const mockAdminUsers: User[] = [
  {
    openid: 'user1',
    nickname: 'RockClimber',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RockClimber',
    gearTags: ['SHOES' as GearType],
    createdAt: new Date(),
    role: 'user',
    isBanned: false,
    climbingAge: 3,
    city: '北京',
    frequentlyVisitedGyms: ['岩时攀岩馆（望京店）'],
    climbingPreferences: ['BOULDERING' as ActivityType],
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    openid: 'user2',
    nickname: 'NewbieClimber',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewbieClimber',
    gearTags: [],
    createdAt: new Date(),
    role: 'user',
    isBanned: false,
    climbingAge: 1,
    city: '上海',
    notificationPreferences: defaultNotificationPreferences,
  },
  {
    openid: 'user3',
    nickname: 'AdminUser',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser',
    gearTags: [],
    createdAt: new Date(),
    role: 'admin',
    isBanned: false,
    notificationPreferences: defaultNotificationPreferences,
  },
];

// Store Implementation
export const useOptimizedStore = create<OptimizedStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          // Initial State
          // User State
          user: null,
          allUsers: mockAdminUsers,
          isAuthenticated: false,
          isLoading: false,
          
          // Activity State
          activities: [],
          currentActivity: null,
          totalActivities: 0,
          isLoadingActivities: false,
          searchText: '',
          selectedTypes: [],
          selectedGrades: [],
          
          // App State
          announcements: [],
          isLoadingAnnouncements: false,
          error: null,
          theme: 'light',

          // User Actions
          setUser: (user) =>
            set((state) => {
              state.user = user ? {
                ...user,
                notificationPreferences: user.notificationPreferences || defaultNotificationPreferences,
              } : null;
              state.isAuthenticated = !!user;
            }),

          logout: () =>
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.activities = [];
              state.currentActivity = null;
              state.totalActivities = 0;
            }),

          setAllUsers: (users) =>
            set((state) => {
              state.allUsers = users.map(u => ({
                ...u,
                notificationPreferences: u.notificationPreferences || defaultNotificationPreferences,
              }));
            }),

          updateUserStatus: (userId, updates) =>
            set((state) => {
              const userIndex = state.allUsers.findIndex(u => u.openid === userId);
              if (userIndex !== -1) {
                Object.assign(state.allUsers[userIndex], updates, { updatedAt: new Date() });
              }
              
              if (state.user?.openid === userId) {
                Object.assign(state.user, updates, { updatedAt: new Date() });
              }
            }),

          updateUserNotificationPreferences: (preferences: Partial<UserNotificationPreferences>) =>
            set((state) => {
              if (state.user && state.user.notificationPreferences) {
                Object.assign(state.user.notificationPreferences, preferences);
              }
            }),

          updateUserProfile: (profileData) =>
            set((state) => {
              if (state.user) {
                Object.assign(state.user, profileData, { updatedAt: new Date() });
                
                const userIndex = state.allUsers.findIndex(u => u.openid === state.user!.openid);
                if (userIndex !== -1) {
                  Object.assign(state.allUsers[userIndex], profileData, { updatedAt: new Date() });
                }
              }
            }),

          setUserLoading: (loading) =>
            set((state) => {
              state.isLoading = loading;
            }),

          // Activity Actions
          setActivities: (activities) =>
            set((state) => {
              state.activities = activities;
              state.totalActivities = activities.length;
            }),

          setCurrentActivity: (activity) =>
            set((state) => {
              state.currentActivity = activity;
            }),

          addActivity: (activity) =>
            set((state) => {
              state.activities.unshift(activity);
              state.totalActivities += 1;
            }),

          updateActivity: (id, updates) =>
            set((state) => {
              const activityIndex = state.activities.findIndex(act => act.id === id);
              if (activityIndex !== -1) {
                Object.assign(state.activities[activityIndex], updates);
              }
              
              if (state.currentActivity?.id === id) {
                Object.assign(state.currentActivity, updates);
              }
            }),

          removeActivity: (id) =>
            set((state) => {
              state.activities = state.activities.filter(act => act.id !== id);
              state.totalActivities = Math.max(0, state.totalActivities - 1);
              
              if (state.currentActivity?.id === id) {
                state.currentActivity = null;
              }
            }),

          setSearchText: (text) =>
            set((state) => {
              state.searchText = text;
            }),

          setSelectedTypes: (types) =>
            set((state) => {
              state.selectedTypes = types;
            }),

          setSelectedGrades: (grades) =>
            set((state) => {
              state.selectedGrades = grades;
            }),

          resetFilters: () =>
            set((state) => {
              state.searchText = '';
              state.selectedTypes = [];
              state.selectedGrades = [];
            }),

          setActivityLoading: (loading) =>
            set((state) => {
              state.isLoadingActivities = loading;
            }),

          // App Actions
          setAnnouncements: (announcements) =>
            set((state) => {
              state.announcements = announcements;
            }),

          setError: (error) =>
            set((state) => {
              state.error = error;
            }),

          toggleTheme: () =>
            set((state) => {
              state.theme = state.theme === 'light' ? 'dark' : 'light';
            }),

          setAnnouncementLoading: (loading) =>
            set((state) => {
              state.isLoadingAnnouncements = loading;
            }),
        }))
      ),
      {
        name: STORAGE_KEYS.USER_PREFERENCES,
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          theme: state.theme,
          searchText: state.searchText,
          selectedTypes: state.selectedTypes,
          selectedGrades: state.selectedGrades,
        }),
      }
    ),
    { name: 'ClimberDaz Store' }
  )
);

// Optimized Selectors (prevent unnecessary re-renders)
export const useUserSelector = () => useOptimizedStore((state) => ({
  user: state.user,
  allUsers: state.allUsers,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
}));

export const useActivitySelector = () => useOptimizedStore((state) => ({
  activities: state.activities,
  currentActivity: state.currentActivity,
  isLoadingActivities: state.isLoadingActivities,
  totalActivities: state.totalActivities,
}));

export const useFilterSelector = () => useOptimizedStore((state) => ({
  searchText: state.searchText,
  selectedTypes: state.selectedTypes,
  selectedGrades: state.selectedGrades,
}));

export const useAppSelector = () => useOptimizedStore((state) => ({
  announcements: state.announcements,
  theme: state.theme,
  error: state.error,
  isLoadingAnnouncements: state.isLoadingAnnouncements,
}));

// Action Selectors
export const useUserActions = () => useOptimizedStore((state) => ({
  setUser: state.setUser,
  logout: state.logout,
  setAllUsers: state.setAllUsers,
  updateUserStatus: state.updateUserStatus,
  updateUserProfile: state.updateUserProfile,
  updateUserNotificationPreferences: state.updateUserNotificationPreferences,
  setUserLoading: state.setUserLoading,
}));

export const useActivityActions = () => useOptimizedStore((state) => ({
  setActivities: state.setActivities,
  setCurrentActivity: state.setCurrentActivity,
  addActivity: state.addActivity,
  updateActivity: state.updateActivity,
  removeActivity: state.removeActivity,
  setActivityLoading: state.setActivityLoading,
}));

export const useFilterActions = () => useOptimizedStore((state) => ({
  setSearchText: state.setSearchText,
  setSelectedTypes: state.setSelectedTypes,
  setSelectedGrades: state.setSelectedGrades,
  resetFilters: state.resetFilters,
}));

export const useAppActions = () => useOptimizedStore((state) => ({
  setAnnouncements: state.setAnnouncements,
  setError: state.setError,
  toggleTheme: state.toggleTheme,
  setAnnouncementLoading: state.setAnnouncementLoading,
})); 