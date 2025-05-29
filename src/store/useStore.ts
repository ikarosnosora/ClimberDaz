import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Activity, Announcement, UserNotificationPreferences, ActivityType, GearType } from '../types';
import { defaultNotificationPreferences } from '../types';

interface UserSlice {
  user: User | null;
  allUsers: User[];
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAllUsers: (users: User[]) => void;
  updateUserStatus: (userId: string, updates: Partial<Pick<User, 'isBanned' | 'role'>>) => void;
  updateUserPreferences: (preferences: Partial<UserNotificationPreferences>) => void;
  updateUserProfile: (profileData: Partial<Pick<User, 'nickname' | 'avatar' | 'climbingAge' | 'introduction' | 'city' | 'frequentlyVisitedGyms' | 'climbingPreferences' | 'gearTags'>>) => void;
  logout: () => void;
}

interface ActivitySlice {
  activities: Activity[];
  currentActivity: Activity | null;
  setActivities: (activities: Activity[]) => void;
  setCurrentActivity: (activity: Activity | null) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
}

interface AppSlice {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  setAnnouncements: (announcements: Announcement[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// New Slice for Activity List Filters
interface ActivityListFiltersSlice {
  activityListSearchText: string;
  activityListSelectedTypes: string[];
  activityListSelectedGrades: string[];
  setActivityListSearchText: (text: string) => void;
  setActivityListSelectedTypes: (types: string[]) => void;
  setActivityListSelectedGrades: (grades: string[]) => void;
  resetActivityListFilters: () => void;
}

export interface StoreState extends UserSlice, ActivitySlice, AppSlice, ActivityListFiltersSlice {}

// Mock users for admin panel demonstration
const mockAdminUsers: User[] = [
  { openid: 'user1', nickname: 'RockClimber', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RockClimber', gearTags: ['SHOES' as GearType], createdAt: new Date(), role: 'user', isBanned: false, climbingAge: 3, city: '北京', frequentlyVisitedGyms: ['岩时攀岩馆（望京店）'], climbingPreferences: ['BOULDERING' as ActivityType] },
  { openid: 'user2', nickname: 'NewbieClimber', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewbieClimber', gearTags: [], createdAt: new Date(), role: 'user', isBanned: false, climbingAge: 1, city: '上海' },
  { openid: 'user3', nickname: 'AdminUser', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser', gearTags: [], createdAt: new Date(), role: 'admin', isBanned: false },
  { openid: 'user4', nickname: 'BannedUserExample', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BannedUserExample', gearTags: [], createdAt: new Date(), role: 'user', isBanned: true },
];

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        // User slice
        user: null,
        allUsers: mockAdminUsers.map(u => ({
            ...u, 
            climbingAge: u.climbingAge,
            introduction: u.introduction,
            city: u.city,
            frequentlyVisitedGyms: u.frequentlyVisitedGyms || [], 
            climbingPreferences: u.climbingPreferences || [],
            isBanned: u.isBanned || false,
            role: u.role || 'user',
            notificationPreferences: u.notificationPreferences || defaultNotificationPreferences,
        })),
        isAuthenticated: false,
        setUser: (user) =>
          set({
            user: user ? {
              ...user,
              climbingAge: user.climbingAge,
              introduction: user.introduction,
              city: user.city,
              frequentlyVisitedGyms: user.frequentlyVisitedGyms || [], 
              climbingPreferences: user.climbingPreferences || [],
              isBanned: user.isBanned || false,
              role: user.role || 'user',
              notificationPreferences: user.notificationPreferences || defaultNotificationPreferences,
            } : null,
            isAuthenticated: !!user,
          }),
        setAllUsers: (users) => set({ allUsers: users.map(u => ({
            ...u,
            climbingAge: u.climbingAge,
            introduction: u.introduction,
            city: u.city,
            frequentlyVisitedGyms: u.frequentlyVisitedGyms || [], 
            climbingPreferences: u.climbingPreferences || [],
            isBanned: u.isBanned || false,
            role: u.role || 'user',
            notificationPreferences: u.notificationPreferences || defaultNotificationPreferences,
        })) }),
        updateUserStatus: (userId, updates) => 
          set((state) => ({
            allUsers: state.allUsers.map((u) => 
              u.openid === userId ? { ...u, ...updates, updatedAt: new Date() } : u
            ),
            user: state.user && state.user.openid === userId ? { ...state.user, ...updates, updatedAt: new Date() } : state.user,
          })),
        updateUserPreferences: (preferences) => 
          set((state) => {
            if (state.user) {
              return {
                user: {
                  ...state.user,
                  notificationPreferences: {
                    ...(state.user.notificationPreferences || defaultNotificationPreferences),
                    ...preferences,
                  },
                  updatedAt: new Date(),
                },
              };
            }
            return {};
          }),
        updateUserProfile: (profileData) =>
          set((state) => {
            if (state.user) {
              const updatedUser = {
                ...state.user,
                ...profileData,
                updatedAt: new Date(),
              };
              const updatedAllUsers = state.allUsers.map(u => 
                u.openid === updatedUser.openid ? updatedUser : u
              );
              return { user: updatedUser, allUsers: updatedAllUsers };
            }
            return {};
          }),
        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
          }),

        // Activity slice
        activities: [],
        currentActivity: null,
        setActivities: (activities) => set({ activities }),
        setCurrentActivity: (activity) =>
          set({ currentActivity: activity }),
        addActivity: (activity) =>
          set((state) => ({
            activities: [activity, ...state.activities],
          })),
        updateActivity: (id, updates) =>
          set((state) => ({
            activities: state.activities.map((act) =>
              act.id === id ? { ...act, ...updates } : act
            ),
          })),
        removeActivity: (id) =>
          set((state) => ({
            activities: state.activities.filter(
              (act) => act.id !== id
            ),
          })),

        // App slice
        announcements: [],
        loading: false,
        error: null,
        setAnnouncements: (announcements) => set({ announcements }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        // Activity List Filters slice
        activityListSearchText: '',
        activityListSelectedTypes: [],
        activityListSelectedGrades: [],
        setActivityListSearchText: (text) => set({ activityListSearchText: text }),
        setActivityListSelectedTypes: (types) => set({ activityListSelectedTypes: types }),
        setActivityListSelectedGrades: (grades) => set({ activityListSelectedGrades: grades }),
        resetActivityListFilters: () =>
          set({
            activityListSearchText: '',
            activityListSelectedTypes: [],
            activityListSelectedGrades: [],
          }),
      }),
      {
        name: 'climberdaz-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          activityListSearchText: state.activityListSearchText,
          activityListSelectedTypes: state.activityListSelectedTypes,
          activityListSelectedGrades: state.activityListSelectedGrades,
          allUsers: state.allUsers,
        }),
      }
    )
  )
); 