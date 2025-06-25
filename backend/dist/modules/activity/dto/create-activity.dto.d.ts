import { ActivityPrivacy, ClimbingType } from '../entities/activity.entity';
export declare class CreateActivityDto {
    title: string;
    description?: string;
    startDatetime: string;
    endDatetime: string;
    climbingType: ClimbingType;
    maxParticipants: number;
    privacy?: ActivityPrivacy;
    costInfo?: string;
    notes?: string;
    gymId: string;
}
