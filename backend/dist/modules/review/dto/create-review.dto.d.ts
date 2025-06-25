import { ReviewRating } from '../entities/review.entity';
export declare class CreateReviewDto {
    activityId: string;
    targetId: string;
    reviewType: ReviewRating;
    comment?: string;
}
