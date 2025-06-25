// Export all API services for convenient access
export { AuthService } from './authService';
export type { LoginRequest, RegisterRequest, AuthResponse } from './authService';

export { ClimbingGymService } from './climbingGymService';
export type { ClimbingGym, CreateClimbingGymRequest } from './climbingGymService';

export { ActivityService } from './activityService';
export type { 
  CreateActivityRequest, 
  UpdateActivityRequest, 
  ActivitySearchParams, 
  ActivityListResponse 
} from './activityService';

export { default as config } from './config'; 