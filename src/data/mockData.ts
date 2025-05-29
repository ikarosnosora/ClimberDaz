import type { User, Activity, Announcement } from '../types';
import { 
  ActivityType, 
  GearType, 
  MeetMode, 
  CostMode, 
  ActivityStatus, 
  DifficultyGrade 
} from '../types';
import { defaultNotificationPreferences } from '../types';

/**
 * Centralized Mock Data
 * Single source of truth for all mock data used throughout the application
 * This eliminates redundancy and makes it easier to maintain consistent test data
 */

// Mock Users
export const mockUsers: User[] = [
  {
    openid: 'user1',
    nickname: 'RockClimber',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RockClimber',
    level: 5,
    gearTags: [GearType.SHOES, GearType.HARNESS, GearType.CHALK],
    createdAt: new Date('2024-01-15'),
    climbingAge: 3,
    introduction: '热爱攀岩的程序员，喜欢挑战V6-V8的线路',
    city: '北京',
    frequentlyVisitedGyms: ['岩时攀岩馆（望京店）', 'MWA攀岩馆'],
    climbingPreferences: [ActivityType.BOULDERING, ActivityType.LEAD_CLIMBING],
    notificationPreferences: defaultNotificationPreferences,
    role: 'user',
    isBanned: false,
  },
  {
    openid: 'user2',
    nickname: 'NewbieClimber',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewbieClimber',
    level: 2,
    gearTags: [GearType.SHOES],
    createdAt: new Date('2024-03-10'),
    climbingAge: 1,
    introduction: '攀岩新手，希望能找到一起学习的朋友',
    city: '上海',
    frequentlyVisitedGyms: ['峭壁芭蕾攀岩馆'],
    climbingPreferences: [ActivityType.BOULDERING, ActivityType.TRAINING],
    notificationPreferences: defaultNotificationPreferences,
    role: 'user',
    isBanned: false,
  },
  {
    openid: 'user3',
    nickname: 'AdminUser',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser',
    level: 8,
    gearTags: [GearType.SHOES, GearType.HARNESS, GearType.ROPE, GearType.QUICKDRAWS, GearType.BELAY_DEVICE],
    createdAt: new Date('2023-12-01'),
    climbingAge: 5,
    introduction: '平台管理员，资深攀岩爱好者',
    city: '深圳',
    frequentlyVisitedGyms: ['KAILAS攀岩馆'],
    climbingPreferences: [ActivityType.BOULDERING, ActivityType.LEAD_CLIMBING, ActivityType.OUTDOOR],
    notificationPreferences: defaultNotificationPreferences,
    role: 'admin',
    isBanned: false,
  },
  {
    openid: 'user4',
    nickname: 'BannedUserExample',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BannedUserExample',
    level: 1,
    gearTags: [],
    createdAt: new Date('2024-04-01'),
    climbingAge: 0,
    city: '广州',
    notificationPreferences: defaultNotificationPreferences,
    role: 'user',
    isBanned: true,
  },
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: '1',
    hostId: 'user1',
    title: '周末一起攀岩吧！V4-V6 level',
    datetime: new Date('2025-06-01T14:00:00'),
    locationText: '岩时攀岩馆（望京店）',
    lat: 39.9884,
    lng: 116.4716,
    meetMode: MeetMode.MEET_AT_ENTRANCE,
    isPrivate: false,
    types: [ActivityType.BOULDERING],
    grades: [DifficultyGrade.V3_V5, DifficultyGrade.V6_V7],
    costMode: CostMode.AA,
    slotMax: 4,
    status: ActivityStatus.OPEN,
    createdAt: new Date('2024-05-15'),
    participantIds: ['user1', 'user2'],
    participantCount: 2,
    host: mockUsers[0],
    distance: 2.5,
  },
  {
    id: '2',
    hostId: 'user2',
    title: '新手友好局，一起学习抱石',
    datetime: new Date('2025-06-02T10:00:00'),
    locationText: 'MWA攀岩馆',
    lat: 39.9304,
    lng: 116.4316,
    meetMode: MeetMode.FIRST_COME_FIRST_CLIMB,
    isPrivate: false,
    types: [ActivityType.BOULDERING, ActivityType.TRAINING],
    grades: [DifficultyGrade.V0_V2],
    costMode: CostMode.FREE,
    slotMax: 6,
    status: ActivityStatus.OPEN,
    createdAt: new Date('2024-05-16'),
    participantIds: ['user2', 'user3', 'user1'],
    participantCount: 3,
    host: mockUsers[1],
    distance: 5.2,
  },
  {
    id: '3',
    hostId: 'user3',
    title: '先锋攀登技术分享',
    datetime: new Date('2025-06-03T19:00:00'),
    locationText: 'KAILAS攀岩馆',
    lat: 40.0084,
    lng: 116.4816,
    meetMode: MeetMode.MEET_AT_ENTRANCE,
    isPrivate: false,
    types: [ActivityType.LEAD_CLIMBING, ActivityType.TRAINING],
    grades: [DifficultyGrade.YDS_5_9_5_10D, DifficultyGrade.YDS_5_11A_5_11D],
    costMode: CostMode.HOST_TREAT,
    slotMax: 8,
    status: ActivityStatus.OPEN,
    createdAt: new Date('2024-05-17'),
    participantIds: ['user3'],
    participantCount: 1,
    host: mockUsers[2],
    distance: 1.8,
  },
  {
    id: '4',
    hostId: 'user1',
    title: '户外攀岩 - 怀柔线路探索',
    datetime: new Date('2025-06-05T08:00:00'),
    locationText: '怀柔区攀岩场地',
    lat: 40.3916,
    lng: 116.6310,
    meetMode: MeetMode.MEET_AT_ENTRANCE,
    isPrivate: false,
    types: [ActivityType.OUTDOOR],
    grades: [DifficultyGrade.YDS_5_5_5_8, DifficultyGrade.YDS_5_9_5_10D],
    costMode: CostMode.AA,
    slotMax: 4,
    status: ActivityStatus.FULL,
    createdAt: new Date('2024-05-18'),
    participantIds: ['user1', 'user2', 'user3', 'user4'],
    participantCount: 4,
    host: mockUsers[0],
    distance: 45.3,
  },
  {
    id: '5',
    hostId: 'user2',
    title: '周中放松攀爬',
    datetime: new Date('2025-05-20T18:30:00'),
    locationText: '峭壁芭蕾攀岩馆',
    lat: 31.2304,
    lng: 121.4737,
    meetMode: MeetMode.FIRST_COME_FIRST_CLIMB,
    isPrivate: false,
    types: [ActivityType.BOULDERING],
    grades: [DifficultyGrade.V0_V2, DifficultyGrade.V3_V5],
    costMode: CostMode.AA,
    slotMax: 5,
    status: ActivityStatus.COMPLETED,
    createdAt: new Date('2024-05-10'),
    participantIds: ['user2', 'user1'],
    participantCount: 2,
    host: mockUsers[1],
    distance: 8.7,
  },
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '🎉 ClimberDaz 正式上线！欢迎各位岩友',
    content: '经过紧张的开发和测试，ClimberDaz攀岩找搭子平台正式上线啦！感谢大家的耐心等待。现在你可以轻松找到攀岩伙伴，创建活动，分享攀岩经验。让我们一起在这个平台上建立一个活跃的攀岩社区！',
    startAt: new Date('2024-05-01'),
    endAt: new Date('2025-12-31'),
    weight: 10,
    createdAt: new Date('2024-05-01'),
  },
  {
    id: '2',
    title: '📢 本周六有官方组织的新手教学活动',
    content: '为了帮助更多新朋友快速入门攀岩运动，我们将在本周六下午2点在岩时攀岩馆举办新手教学活动。活动包括：基础攀爬技巧、安全知识讲解、装备介绍等。活动免费，欢迎新手朋友参加！',
    startAt: new Date('2024-05-20'),
    endAt: new Date('2024-06-30'),
    weight: 8,
    createdAt: new Date('2024-05-20'),
  },
  {
    id: '3',
    title: '⚠️ 平台维护通知',
    content: '为了提供更好的服务，平台将在本周日凌晨2:00-4:00进行系统维护升级。维护期间可能无法正常访问，给您带来的不便敬请谅解。',
    startAt: new Date('2024-05-25'),
    endAt: new Date('2024-05-26'),
    weight: 6,
    createdAt: new Date('2024-05-25'),
  },
];

// Helper functions to get mock data
export const getMockUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.openid === userId);
};

export const getMockActivityById = (activityId: string): Activity | undefined => {
  return mockActivities.find(activity => activity.id === activityId);
};

export const getMockActivitiesByHost = (hostId: string): Activity[] => {
  return mockActivities.filter(activity => activity.hostId === hostId);
};

export const getMockActivitiesByType = (type: ActivityType): Activity[] => {
  return mockActivities.filter(activity => activity.types.includes(type));
};

export const getMockActiveAnnouncements = (): Announcement[] => {
  const now = new Date();
  return mockAnnouncements
    .filter(announcement => 
      announcement.startAt <= now && announcement.endAt >= now
    )
    .sort((a, b) => b.weight - a.weight);
};

// Export collections
export const MOCK_DATA = {
  users: mockUsers,
  activities: mockActivities,
  announcements: mockAnnouncements,
} as const; 