import { ActivityStatus, ClimbingType } from '../entities/activity.entity';
export declare class QueryActivityDto {
    page?: number;
    limit?: number;
    status?: ActivityStatus;
    climbingType?: ClimbingType;
    gymId?: string;
    city?: string;
    search?: string;
    startDateFrom?: Date;
    startDateTo?: Date;
    organizerId?: string;
    includePrivate?: boolean;
}
