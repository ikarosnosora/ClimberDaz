"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const review_chain_entity_1 = require("./entities/review-chain.entity");
let ReviewService = class ReviewService {
    constructor(reviewRepository, reviewChainRepository) {
        this.reviewRepository = reviewRepository;
        this.reviewChainRepository = reviewChainRepository;
    }
    async generateReviewChain(activityId, participantIds) {
        if (participantIds.length < 2) {
            throw new common_1.BadRequestException('参与人数不足，无法生成评价链');
        }
        const shuffledParticipants = this.shuffleArray([...participantIds]);
        const now = new Date();
        const triggerTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const expireTime = new Date(triggerTime.getTime() + 48 * 60 * 60 * 1000);
        const chain = this.reviewChainRepository.create({
            activityId,
            userSequence: shuffledParticipants,
            status: review_chain_entity_1.ChainStatus.PENDING,
            triggerTime,
            expireTime,
            completedCount: 0,
            totalCount: shuffledParticipants.length,
        });
        const savedChain = await this.reviewChainRepository.save(chain);
        for (let i = 0; i < shuffledParticipants.length; i++) {
            const reviewerId = shuffledParticipants[i];
            const revieweeId = shuffledParticipants[(i + 1) % shuffledParticipants.length];
            const review = this.reviewRepository.create({
                activityId,
                reviewerId,
                revieweeId,
                chainId: savedChain.id,
                rating: review_entity_1.ReviewRating.SKIP,
                isSubmitted: false,
                submitDeadline: expireTime,
            });
            await this.reviewRepository.save(review);
        }
        return savedChain;
    }
    async submitReview(createReviewDto, reviewerId) {
        const { activityId, targetId, reviewType, comment } = createReviewDto;
        const review = await this.reviewRepository.findOne({
            where: {
                activityId,
                reviewerId,
                revieweeId: targetId,
                isSubmitted: false,
            },
        });
        if (!review) {
            throw new common_1.NotFoundException('未找到对应的评价或评价已完成');
        }
        review.rating = reviewType;
        review.comment = comment;
        review.isSubmitted = true;
        const savedReview = await this.reviewRepository.save(review);
        const chain = await this.reviewChainRepository.findOne({
            where: { id: review.chainId },
        });
        if (chain) {
            chain.completedCount++;
            if (chain.completedCount >= chain.totalCount) {
                chain.status = review_chain_entity_1.ChainStatus.COMPLETED;
            }
            await this.reviewChainRepository.save(chain);
        }
        return savedReview;
    }
    async getUserReviews(userId, type = 'received') {
        const whereClause = type === 'received'
            ? { revieweeId: userId }
            : { reviewerId: userId };
        return this.reviewRepository.find({
            where: whereClause,
            relations: ['reviewer', 'reviewee', 'activity'],
            order: { createdAt: 'DESC' },
        });
    }
    async getPendingReviews(userId) {
        return this.reviewRepository.find({
            where: {
                reviewerId: userId,
                isSubmitted: false,
            },
            relations: ['reviewee', 'activity'],
            order: { createdAt: 'ASC' },
        });
    }
    async getUserReviewStats(userId) {
        const received = await this.reviewRepository.find({
            where: { revieweeId: userId, isSubmitted: true },
        });
        const given = await this.reviewRepository.find({
            where: { reviewerId: userId, isSubmitted: true },
        });
        const stats = {
            receivedCount: received.length,
            givenCount: given.length,
            goodCount: received.filter(r => r.rating === review_entity_1.ReviewRating.GOOD).length,
            badCount: received.filter(r => r.rating === review_entity_1.ReviewRating.BAD).length,
            noShowCount: received.filter(r => r.rating === review_entity_1.ReviewRating.NO_SHOW).length,
            skipCount: received.filter(r => r.rating === review_entity_1.ReviewRating.SKIP).length,
            positiveRate: received.length > 0 ?
                (received.filter(r => r.rating === review_entity_1.ReviewRating.GOOD).length / received.length * 100).toFixed(1) : '0',
        };
        return stats;
    }
    async getActivityReviews(activityId) {
        const reviews = await this.reviewRepository.find({
            where: { activityId },
            relations: ['reviewer', 'reviewee'],
        });
        const chain = await this.reviewChainRepository.findOne({
            where: { activityId },
        });
        return {
            reviews,
            chain,
            totalReviews: chain?.totalCount || 0,
            completedReviews: chain?.completedCount || 0,
            completionRate: chain && chain.totalCount > 0 ?
                (chain.completedCount / chain.totalCount * 100).toFixed(1) : '0',
        };
    }
    async sendReviewReminders() {
        const now = new Date();
        const chainsToActivate = await this.reviewChainRepository.find({
            where: {
                status: review_chain_entity_1.ChainStatus.PENDING,
            },
        });
        for (const chain of chainsToActivate) {
            if (chain.triggerTime <= now) {
                chain.status = review_chain_entity_1.ChainStatus.ACTIVE;
                await this.reviewChainRepository.save(chain);
            }
        }
        const chainsToExpire = await this.reviewChainRepository.find({
            where: {
                status: review_chain_entity_1.ChainStatus.ACTIVE,
            },
        });
        for (const chain of chainsToExpire) {
            if (chain.expireTime <= now) {
                chain.status = review_chain_entity_1.ChainStatus.EXPIRED;
                await this.reviewChainRepository.save(chain);
            }
        }
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(review_chain_entity_1.ReviewChain)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewService);
//# sourceMappingURL=review.service.js.map