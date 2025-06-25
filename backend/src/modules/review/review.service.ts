import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewRating } from './entities/review.entity';
import { ReviewChain, ChainStatus } from './entities/review-chain.entity';
import { CreateReviewDto, ReviewChainDto } from './dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewChain)
    private reviewChainRepository: Repository<ReviewChain>,
  ) {}

  /**
   * 活动结束后生成链式评价序列
   */
  async generateReviewChain(activityId: string, participantIds: string[]): Promise<ReviewChain> {
    if (participantIds.length < 2) {
      throw new BadRequestException('参与人数不足，无法生成评价链');
    }

    // 随机打乱参与者顺序
    const shuffledParticipants = this.shuffleArray([...participantIds]);
    
    // 设置触发时间（活动结束后2小时）和过期时间（48小时后）
    const now = new Date();
    const triggerTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2小时后
    const expireTime = new Date(triggerTime.getTime() + 48 * 60 * 60 * 1000); // 48小时后

    // 创建评价链
    const chain = this.reviewChainRepository.create({
      activityId,
      userSequence: shuffledParticipants,
      status: ChainStatus.PENDING,
      triggerTime,
      expireTime,
      completedCount: 0,
      totalCount: shuffledParticipants.length,
    });

    const savedChain = await this.reviewChainRepository.save(chain);

    // 为每个评价关系创建 Review 记录
    for (let i = 0; i < shuffledParticipants.length; i++) {
      const reviewerId = shuffledParticipants[i];
      const revieweeId = shuffledParticipants[(i + 1) % shuffledParticipants.length];

      const review = this.reviewRepository.create({
        activityId,
        reviewerId,
        revieweeId,
        chainId: savedChain.id,
        rating: ReviewRating.SKIP, // 默认跳过，等待用户修改
        isSubmitted: false,
        submitDeadline: expireTime,
      });

      await this.reviewRepository.save(review);
    }

    return savedChain;
  }

  /**
   * 用户提交评价
   */
  async submitReview(createReviewDto: CreateReviewDto, reviewerId: string): Promise<Review> {
    const { activityId, targetId, reviewType, comment } = createReviewDto;

    // 检查评价是否存在
    const review = await this.reviewRepository.findOne({
      where: {
        activityId,
        reviewerId,
        revieweeId: targetId,
        isSubmitted: false,
      },
    });

    if (!review) {
      throw new NotFoundException('未找到对应的评价或评价已完成');
    }

    // 更新评价
    review.rating = reviewType as ReviewRating;
    review.comment = comment;
    review.isSubmitted = true;

    const savedReview = await this.reviewRepository.save(review);

    // 更新评价链完成状态
    const chain = await this.reviewChainRepository.findOne({
      where: { id: review.chainId },
    });

    if (chain) {
      chain.completedCount++;
      if (chain.completedCount >= chain.totalCount) {
        chain.status = ChainStatus.COMPLETED;
      }
      await this.reviewChainRepository.save(chain);
    }

    return savedReview;
  }

  /**
   * 获取用户的评价历史
   */
  async getUserReviews(userId: string, type: 'received' | 'given' = 'received') {
    const whereClause = type === 'received' 
      ? { revieweeId: userId } 
      : { reviewerId: userId };

    return this.reviewRepository.find({
      where: whereClause,
      relations: ['reviewer', 'reviewee', 'activity'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取用户待评价列表
   */
  async getPendingReviews(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: {
        reviewerId: userId,
        isSubmitted: false,
      },
      relations: ['reviewee', 'activity'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 获取用户评价统计
   */
  async getUserReviewStats(userId: string) {
    const received = await this.reviewRepository.find({
      where: { revieweeId: userId, isSubmitted: true },
    });

    const given = await this.reviewRepository.find({
      where: { reviewerId: userId, isSubmitted: true },
    });

    const stats = {
      receivedCount: received.length,
      givenCount: given.length,
      goodCount: received.filter(r => r.rating === ReviewRating.GOOD).length,
      badCount: received.filter(r => r.rating === ReviewRating.BAD).length,
      noShowCount: received.filter(r => r.rating === ReviewRating.NO_SHOW).length,
      skipCount: received.filter(r => r.rating === ReviewRating.SKIP).length,
      positiveRate: received.length > 0 ? 
        (received.filter(r => r.rating === ReviewRating.GOOD).length / received.length * 100).toFixed(1) : '0',
    };

    return stats;
  }

  /**
   * 获取活动的评价情况
   */
  async getActivityReviews(activityId: string) {
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

  /**
   * 发送评价提醒（定时任务用）
   */
  async sendReviewReminders(): Promise<void> {
    const now = new Date();
    
    // 找到应该激活但还未激活的评价链
    const chainsToActivate = await this.reviewChainRepository.find({
      where: {
        status: ChainStatus.PENDING,
      },
    });

    for (const chain of chainsToActivate) {
      if (chain.triggerTime <= now) {
        chain.status = ChainStatus.ACTIVE;
        await this.reviewChainRepository.save(chain);
      }
    }

    // 找到过期的评价链
    const chainsToExpire = await this.reviewChainRepository.find({
      where: {
        status: ChainStatus.ACTIVE,
      },
    });

    for (const chain of chainsToExpire) {
      if (chain.expireTime <= now) {
        chain.status = ChainStatus.EXPIRED;
        await this.reviewChainRepository.save(chain);
      }
    }
  }

  /**
   * 数组随机打乱
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 