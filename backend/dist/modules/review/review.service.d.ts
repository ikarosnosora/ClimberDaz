import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewChain } from './entities/review-chain.entity';
import { CreateReviewDto } from './dto';
export declare class ReviewService {
    private reviewRepository;
    private reviewChainRepository;
    constructor(reviewRepository: Repository<Review>, reviewChainRepository: Repository<ReviewChain>);
    generateReviewChain(activityId: string, participantIds: string[]): Promise<ReviewChain>;
    submitReview(createReviewDto: CreateReviewDto, reviewerId: string): Promise<Review>;
    getUserReviews(userId: string, type?: 'received' | 'given'): Promise<Review[]>;
    getPendingReviews(userId: string): Promise<Review[]>;
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
    sendReviewReminders(): Promise<void>;
    private shuffleArray;
}
