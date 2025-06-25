import { User } from '../../user/entities/user.entity';
import { ClimbingGym } from '../../climbing-gym/entities/climbing-gym.entity';
import { Review } from '../../review/entities/review.entity';
export declare enum ActivityStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export declare enum ActivityPrivacy {
    PUBLIC = "public",
    PRIVATE = "private"
}
export declare enum ClimbingType {
    BOULDERING = "bouldering",
    TOP_ROPE = "top_rope",
    LEAD_CLIMBING = "lead_climbing",
    MIXED = "mixed"
}
export declare class Activity {
    id: string;
    title: string;
    description?: string;
    startDatetime: Date;
    endDatetime: Date;
    climbingType: ClimbingType;
    maxParticipants: number;
    currentParticipants: number;
    status: ActivityStatus;
    privacy: ActivityPrivacy;
    costInfo?: string;
    notes?: string;
    organizerId: string;
    gymId: string;
    createdAt: Date;
    updatedAt: Date;
    organizer: User;
    gym: ClimbingGym;
    reviews: Review[];
    locationText?: string;
    gymAddress?: string;
    gymCity?: string;
    timeRange?: string;
    canJoin?: boolean;
    minutesToStart?: number;
}
