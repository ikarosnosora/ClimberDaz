import { apiRequest } from '../../utils/api';
import config from './config';
import { Activity, ActivityType, MeetMode, CostMode, DifficultyGrade, ActivityStatus } from '../../types';

export interface CreateActivityRequest {
  title: string;
  startDateTime: Date;
  endDateTime: Date;
  gymId: number;
  meetMode: MeetMode;
  activityType: ActivityType;
  difficulty?: DifficultyGrade;
  costMode: CostMode;
  cost?: number;
  maxParticipants: number;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateActivityRequest {
  title?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  gymId?: number;
  meetMode?: MeetMode;
  activityType?: ActivityType;
  difficulty?: DifficultyGrade;
  costMode?: CostMode;
  cost?: number;
  maxParticipants?: number;
  description?: string;
  isPrivate?: boolean;
}

export interface ActivitySearchParams {
  search?: string;
  activityType?: ActivityType[];
  difficulty?: DifficultyGrade[];
  city?: string;
  gymId?: number;
  startDate?: Date;
  endDate?: Date;
  isPrivate?: boolean;
  status?: ActivityStatus;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface ActivityListResponse {
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ActivityService {
  /**
   * Get all activities with optional filtering
   */
  static async getAll(params?: ActivitySearchParams): Promise<ActivityListResponse> {
    return await apiRequest.get<ActivityListResponse>(
      config.endpoints.activities.base,
      params
    );
  }

  /**
   * Get activity by ID
   */
  static async getById(id: string): Promise<Activity> {
    return await apiRequest.get<Activity>(
      config.endpoints.activities.byId(id)
    );
  }

  /**
   * Create new activity
   */
  static async create(activityData: CreateActivityRequest): Promise<Activity> {
    return await apiRequest.post<Activity>(
      config.endpoints.activities.base,
      activityData
    );
  }

  /**
   * Update activity
   */
  static async update(id: string, activityData: UpdateActivityRequest): Promise<Activity> {
    return await apiRequest.patch<Activity>(
      config.endpoints.activities.byId(id),
      activityData
    );
  }

  /**
   * Delete activity
   */
  static async delete(id: string): Promise<void> {
    await apiRequest.delete(config.endpoints.activities.byId(id));
  }

  /**
   * Join activity
   */
  static async join(id: string): Promise<Activity> {
    return await apiRequest.post<Activity>(
      config.endpoints.activities.join(id)
    );
  }

  /**
   * Leave activity
   */
  static async leave(id: string): Promise<Activity> {
    return await apiRequest.delete<Activity>(
      config.endpoints.activities.leave(id)
    );
  }

  /**
   * Search activities
   */
  static async search(params: ActivitySearchParams): Promise<ActivityListResponse> {
    return await apiRequest.get<ActivityListResponse>(
      config.endpoints.activities.search,
      params
    );
  }

  /**
   * Get user's activities
   */
  static async getMyActivities(params?: {
    page?: number;
    limit?: number;
    status?: ActivityStatus;
  }): Promise<ActivityListResponse> {
    return await apiRequest.get<ActivityListResponse>(
      config.endpoints.activities.my,
      params
    );
  }

  /**
   * Get activities by status
   */
  static async getByStatus(status: ActivityStatus, params?: ActivitySearchParams): Promise<ActivityListResponse> {
    return await this.getAll({ ...params, status });
  }

  /**
   * Get ongoing activities
   */
  static async getOngoing(params?: ActivitySearchParams): Promise<ActivityListResponse> {
    return await this.getByStatus(ActivityStatus.ONGOING, params);
  }

  /**
   * Get open activities (available to join)
   */
  static async getOpen(params?: ActivitySearchParams): Promise<ActivityListResponse> {
    return await this.getByStatus(ActivityStatus.OPEN, params);
  }

  /**
   * Get ongoing activities (alternative method for instance usage)
   */
  static async getOngoingActivities(params?: ActivitySearchParams): Promise<Activity[]> {
    const response = await this.getOngoing(params);
    return response.activities;
  }

  /**
   * Get open activities (alternative method for instance usage)
   */
  static async getOpenActivities(params?: ActivitySearchParams): Promise<Activity[]> {
    const response = await this.getOpen(params);
    return response.activities;
  }

  /**
   * Search activities (alternative method for instance usage)
   */
  static async searchActivities(params: ActivitySearchParams): Promise<Activity[]> {
    const response = await this.search(params);
    return response.activities;
  }

  /**
   * Get activities by status (alternative method for instance usage)
   */
  static async getActivitiesByStatus(status: ActivityStatus, params?: ActivitySearchParams): Promise<Activity[]> {
    const response = await this.getByStatus(status, params);
    return response.activities;
  }
} 