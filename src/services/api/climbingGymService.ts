import { apiRequest } from '../../utils/api';
import config from './config';

export interface ClimbingGym {
  id: number;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  facilities?: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClimbingGymRequest {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  facilities?: string[];
  description?: string;
}

export class ClimbingGymService {
  /**
   * Get all climbing gyms
   */
  static async getAll(): Promise<ClimbingGym[]> {
    return await apiRequest.get<ClimbingGym[]>(config.endpoints.climbingGyms.base);
  }

  /**
   * Get climbing gym by ID
   */
  static async getById(id: number): Promise<ClimbingGym> {
    return await apiRequest.get<ClimbingGym>(
      config.endpoints.climbingGyms.byId(id)
    );
  }

  /**
   * Get climbing gyms by city
   */
  static async getByCity(city: string): Promise<ClimbingGym[]> {
    return await apiRequest.get<ClimbingGym[]>(
      config.endpoints.climbingGyms.byCity(city)
    );
  }

  /**
   * Search climbing gyms
   */
  static async search(searchParams: {
    query?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<ClimbingGym[]> {
    return await apiRequest.get<ClimbingGym[]>(
      config.endpoints.climbingGyms.search,
      searchParams
    );
  }

  /**
   * Create new climbing gym (admin only)
   */
  static async create(gymData: CreateClimbingGymRequest): Promise<ClimbingGym> {
    return await apiRequest.post<ClimbingGym>(
      config.endpoints.climbingGyms.base,
      gymData
    );
  }

  /**
   * Update climbing gym (admin only)
   */
  static async update(id: number, gymData: Partial<CreateClimbingGymRequest>): Promise<ClimbingGym> {
    return await apiRequest.patch<ClimbingGym>(
      config.endpoints.climbingGyms.byId(id),
      gymData
    );
  }

  /**
   * Delete climbing gym (admin only)
   */
  static async delete(id: number): Promise<void> {
    await apiRequest.delete(config.endpoints.climbingGyms.byId(id));
  }

  /**
   * Get available cities
   */
  static async getCities(): Promise<string[]> {
    const gyms = await this.getAll();
    const cities = [...new Set(gyms.map(gym => gym.city))];
    return cities.sort();
  }
} 