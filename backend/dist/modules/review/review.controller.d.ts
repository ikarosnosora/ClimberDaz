import { ReviewService } from './review.service';
import { CreateReviewDto, ReviewChainDto } from './dto';
import { Review } from './entities/review.entity';
import { ReviewChain } from './entities/review-chain.entity';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    submitReview(createReviewDto: CreateReviewDto, req: any): Promise<Review>;
    generateReviewChain(reviewChainDto: ReviewChainDto): Promise<ReviewChain>;
    getPendingReviews(req: any): Promise<Review[]>;
    getMyReviews(req: any, type?: 'received' | 'given'): Promise<Review[]>;
    getMyReviewStats(req: any): Promise<{
        receivedCount: number;
        givenCount: number;
        goodCount: number;
        badCount: number;
        noShowCount: number;
        skipCount: number;
        positiveRate: string;
    }>;
    getUserReviews(userId: string, type?: 'received' | 'given'): Promise<Review[]>;
    getUserReviewStats(userId: string): Promise<{
        receivedCount: number;
        givenCount: number;
        goodCount: number;
        badCount: number;
        noShowCount: number;
        skipCount: number;
        positiveRate: string;
    }>;
    getActivityReviews(activityId: string): Promise<{
        reviews: Review[];
        chain: ReviewChain;
        totalReviews: number;
        completedReviews: number;
        completionRate: string;
    }>;
    sendReviewReminders(): Promise<{
        message: string;
    }>;
}
