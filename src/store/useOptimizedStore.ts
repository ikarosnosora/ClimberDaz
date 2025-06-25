import { createWithEqualityFn } from 'zustand/traditional';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
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
import { mockActivities, mockAnnouncements } from '../data/mockData';
import { ActivityService } from '../services/api/activityService';

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
  
  // API Integration
  fetchActivities: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  
  // Activity Participation
  joinActivity: (activityId: string) => Promise<void>;
  leaveActivity: (activityId: string) => Promise<void>;
  
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

// Store Implementation with proper migration
export const useOptimizedStore = createWithEqualityFn<OptimizedStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, _get) => ({
          // Initial State
          // User State
          user: null,
          allUsers: mockAdminUsers,
          isAuthenticated: false,
          isLoading: false,
          
          // Activity State - Start with empty array, will be populated by API calls
          activities: [],
          currentActivity: null,
          totalActivities: 0,
          isLoadingActivities: false,
          searchText: '',
          selectedTypes: [],
          selectedGrades: [],
          
          // App State - Initialize with mock announcements
          announcements: mockAnnouncements,
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
              // Reset activities and current state on logout
              state.activities = [];
              state.currentActivity = null;
              state.totalActivities = 0;
              // Clear search filters
              state.searchText = '';
              state.selectedTypes = [];
              state.selectedGrades = [];
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
                Object.assign(state.allUsers[userIndex], updates);
              }
              
              // Update current user if it matches
              if (state.user?.openid === userId) {
                Object.assign(state.user, updates);
              }
            }),

          updateUserProfile: (profileData) =>
            set((state) => {
              if (state.user) {
                Object.assign(state.user, profileData);
                
                // Update in allUsers array if present
                const userIndex = state.allUsers.findIndex(u => u.openid === state.user!.openid);
                if (userIndex !== -1) {
                  Object.assign(state.allUsers[userIndex], profileData);
                }
              }
            }),

          updateUserNotificationPreferences: (preferences) =>
            set((state) => {
              if (state.user && state.user.notificationPreferences) {
                Object.assign(state.user.notificationPreferences, preferences);
              }
            }),

          setUserLoading: (loading) =>
            set((state) => {
              state.isLoading = loading;
            }),

          // Activity Actions - Optimized with batch updates
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
              // Check for duplicates before adding
              const exists = state.activities.some(a => a.id === activity.id);
              if (!exists) {
                state.activities.unshift(activity); // Add to beginning for latest first
                state.totalActivities += 1;
              }
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
              const initialLength = state.activities.length;
              state.activities = state.activities.filter(act => act.id !== id);
              
              // Only update totalActivities if an item was actually removed
              if (state.activities.length < initialLength) {
                state.totalActivities = Math.max(0, state.totalActivities - 1);
              }
              
              if (state.currentActivity?.id === id) {
                state.currentActivity = null;
              }
            }),

          // Optimized participation actions with real API calls
          joinActivity: async (activityId: string) => {
            const state = _get();
            if (!state.user) {
              throw new Error('User not authenticated');
            }
            
            try {
              // Implement join activity API call
              const response = await fetch(`/api/activities/${activityId}/join`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${state.user.token}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to join activity');
              }
              
              // Refresh activities after joining
              await _get().fetchActivities();
            } catch (error) {
              throw error;
            }
          },

          leaveActivity: async (activityId: string) => {
            const state = _get();
            if (!state.user) {
              throw new Error('User not authenticated');
            }
            
            try {
              // Implement leave activity API call
              const response = await fetch(`/api/activities/${activityId}/leave`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${state.user.token}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to leave activity');
              }
              
              // Refresh activities after leaving
              await _get().fetchActivities();
            } catch (error) {
              throw error;
            }
          },

          // Filter actions - with debouncing consideration
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

          // API Integration with fallback to mock data
          fetchActivities: async () => {
            try {
              set((state) => {
                state.isLoadingActivities = true;
              });
              
              try {
                const response = await ActivityService.getAll();
                set((state) => {
                  state.activities = response.activities || [];
                  state.totalActivities = response.total || response.activities?.length || 0;
                  state.isLoadingActivities = false;
                  state.error = null;
                });
                console.log('[Store] Successfully fetched activities from API:', response.activities?.length);
              } catch (apiError) {
                console.warn('[Store] API call failed, falling back to mock data:', apiError);
                // Fallback to mock data if API fails
                set((state) => {
                  state.activities = mockActivities;
                  state.totalActivities = mockActivities.length;
                  state.isLoadingActivities = false;
                  state.error = 'Using mock data - API unavailable';
                });
              }
            } catch (error) {
              console.error('Failed to fetch activities:', error);
              set((state) => {
                state.isLoadingActivities = false;
                state.error = error instanceof Error ? error.message : 'Failed to fetch activities';
              });
              throw error;
            }
          },

          refreshActivities: async () => {
            try {
              set((state) => {
                state.isLoadingActivities = true;
              });
              
              try {
                const response = await ActivityService.getAll();
                set((state) => {
                  state.activities = response.activities || [];
                  state.totalActivities = response.total || response.activities?.length || 0;
                  state.isLoadingActivities = false;
                  state.error = null;
                });
                console.log('[Store] Successfully refreshed activities from API:', response.activities?.length);
              } catch (apiError) {
                console.warn('[Store] API refresh failed, falling back to mock data:', apiError);
                // Fallback to mock data if API fails
                set((state) => {
                  state.activities = mockActivities;
                  state.totalActivities = mockActivities.length;
                  state.isLoadingActivities = false;
                  state.error = 'Using mock data - API unavailable';
                });
              }
            } catch (error) {
              console.error('Failed to refresh activities:', error);
              set((state) => {
                state.isLoadingActivities = false;
                state.error = error instanceof Error ? error.message : 'Failed to refresh activities';
              });
              throw error;
            }
          },
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
        // Add version and migration support
        version: 1,
        migrate: (persistedState: any, version: number) => {
          console.log(`[Store] Migrating state from version ${version} to 1`);
          
          // Handle migration from older versions
          if (version === 0 || !version) {
            // Migration from version 0 (or no version) to version 1
            return {
              ...persistedState,
              // Add any new default values or fix corrupted state
              theme: persistedState.theme || 'light',
              searchText: persistedState.searchText || '',
              selectedTypes: Array.isArray(persistedState.selectedTypes) ? persistedState.selectedTypes : [],
              selectedGrades: Array.isArray(persistedState.selectedGrades) ? persistedState.selectedGrades : [],
              // Ensure user has proper notification preferences
              user: persistedState.user ? {
                ...persistedState.user,
                notificationPreferences: persistedState.user.notificationPreferences || defaultNotificationPreferences,
              } : null,
            };
          }
          
          return persistedState;
        },
        // Handle storage errors gracefully
        onRehydrateStorage: () => {
          return (_state, error) => {
            if (error) {
              console.error('[Store] Failed to rehydrate state:', error);
              // Clear corrupted storage
              localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
            } else {
              console.log('[Store] State rehydrated successfully');
            }
          };
        },
      }
    ),
    { 
      name: 'ClimberDaz Store',
      // Only enable Redux DevTools in development
      enabled: process.env.NODE_ENV === 'development',
    }
  ),
  shallow
);

// Optimized Selectors with shallow comparison to prevent unnecessary re-renders
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

// Granular selectors for specific use cases
export const useIsAuthenticated = () => useOptimizedStore((state) => state.isAuthenticated);
export const useCurrentUser = () => useOptimizedStore((state) => state.user);
export const useTheme = () => useOptimizedStore((state) => state.theme);
export const useActivities = () => useOptimizedStore((state) => state.activities);
export const useCurrentActivity = () => useOptimizedStore((state) => state.currentActivity);
export const useSearchText = () => useOptimizedStore((state) => state.searchText);

// Action Selectors - Memoized to prevent recreation
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
  joinActivity: state.joinActivity,
  leaveActivity: state.leaveActivity,
  setActivityLoading: state.setActivityLoading,
  fetchActivities: state.fetchActivities,
  refreshActivities: state.refreshActivities,
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

// Performance monitoring for store (development only)
if (process.env.NODE_ENV === 'development') {
  useOptimizedStore.subscribe(
    (state, prevState) => {
      const changedKeys = Object.keys(state).filter(key => 
        state[key as keyof typeof state] !== prevState[key as keyof typeof prevState]
      );
      if (changedKeys.length > 0) {
        console.log('[Store Debug] State changed:', changedKeys);
      }
    }
  );
} 