import { User } from '../../user/entities/user.entity';
import { Activity } from '../../activity/entities/activity.entity';
export declare enum ReviewRating {
    GOOD = "good",
    BAD = "bad",
    NO_SHOW = "no_show",
    SKIP = "skip"
}
export declare class Review {
    id: string;
    rating: ReviewRating;
    comment?: string;
    activityId: string;
    reviewerId: string;
    revieweeId: string;
    chainId: string;
    isSubmitted: boolean;
    submitDeadline: Date;
    createdAt: Date;
    updatedAt: Date;
    activity: Activity;
    reviewer: User;
    reviewee: User;
}
