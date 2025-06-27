import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Activity, ActivityStatus } from '../../activity/entities/activity.entity';
import { User } from '../../user/entities/user.entity';
import { ClimbingGym } from '../../climbing-gym/entities/climbing-gym.entity';
import { Review } from '../../review/entities/review.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';

@Injectable()
export class AdminActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ClimbingGym)
    private gymRepository: Repository<ClimbingGym>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async findAll(query: ActivityQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      gymId,
      organizerId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
      activityStartDate,
      activityEndDate,
    } = query;

    const queryBuilder = this.activityRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.climbingGym', 'climbingGym')
      .leftJoinAndSelect('activity.participants', 'participants');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(activity.title LIKE :search OR activity.description LIKE :search OR creator.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('activity.status = :status', { status });
    }

    // Filter by climbing gym
    if (gymId) {
      queryBuilder.andWhere('activity.gymId = :gymId', { gymId });
    }

    // Filter by organizer
    if (organizerId) {
      queryBuilder.andWhere('activity.organizerId = :organizerId', { organizerId });
    }

    // Date range filter for creation date
    if (startDate && endDate) {
      queryBuilder.andWhere('activity.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Date range filter for activity date
    if (activityStartDate && activityEndDate) {
      queryBuilder.andWhere('activity.date BETWEEN :activityStartDate AND :activityEndDate', {
        activityStartDate,
        activityEndDate,
      });
    }

    // Sorting
    queryBuilder.orderBy(`activity.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [activities, total] = await queryBuilder.getManyAndCount();

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['creator', 'climbingGym', 'participants', 'reviews'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    // Validate organizer exists
    const organizer = await this.userRepository.findOne({
      where: { id: createActivityDto.organizerId },
    });
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    // Validate climbing gym exists
    const gym = await this.gymRepository.findOne({
      where: { id: createActivityDto.gymId },
    });
    if (!gym) {
      throw new NotFoundException('Climbing gym not found');
    }

    const activity = this.activityRepository.create(createActivityDto);
    return await this.activityRepository.save(activity);
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);

    // Validate organizer if provided
    if (updateActivityDto.organizerId) {
      const organizer = await this.userRepository.findOne({
        where: { id: updateActivityDto.organizerId },
      });
      if (!organizer) {
        throw new NotFoundException('Organizer not found');
      }
    }

    // Validate climbing gym if provided
    if (updateActivityDto.gymId) {
      const gym = await this.gymRepository.findOne({
        where: { id: updateActivityDto.gymId },
      });
      if (!gym) {
        throw new NotFoundException('Climbing gym not found');
      }
    }

    Object.assign(activity, updateActivityDto);
    return await this.activityRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    await this.activityRepository.remove(activity);
  }

  async updateStatus(id: string, status: ActivityStatus): Promise<Activity> {
    const activity = await this.findOne(id);
    activity.status = status;
    return await this.activityRepository.save(activity);
  }

  async getActivityAnalytics(id: string) {
    const activity = await this.findOne(id);

    // Get participant count
    const participantCount = activity.currentParticipants || 0;

    // Get reviews for this activity
    const reviews = await this.reviewRepository.find({
      where: { activityId: id },
      relations: ['user'],
    });

    const totalReviews = reviews.length;
    const averageRating = 0; // Note: Review entity uses enum (EXCELLENT, GOOD, BAD, NO_SHOW, SKIP), not numeric rating

    // Calculate days until activity
    const now = new Date();
    const activityDate = new Date(activity.startDatetime);
    const daysUntilActivity = Math.ceil((activityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      activity,
      analytics: {
        participantCount,
        maxParticipants: activity.maxParticipants,
        participationRate: activity.maxParticipants > 0 
          ? Math.round((participantCount / activity.maxParticipants) * 100) 
          : 0,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        daysUntilActivity,
        isUpcoming: daysUntilActivity > 0,
        isPast: daysUntilActivity < 0,
        reviews: reviews.slice(0, 5), // Recent 5 reviews
      },
    };
  }

  async getActivityStats() {
    const total = await this.activityRepository.count();
    const active = await this.activityRepository.count({ where: { status: ActivityStatus.CONFIRMED } });
    const completed = await this.activityRepository.count({ where: { status: ActivityStatus.COMPLETED } });
    const cancelled = await this.activityRepository.count({ where: { status: ActivityStatus.CANCELLED } });
    const pending = await this.activityRepository.count({ where: { status: ActivityStatus.PENDING } });
    
    // Activities created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newActivities = await this.activityRepository.count({
      where: { createdAt: Between(thirtyDaysAgo, new Date()) },
    });

    // Activities created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayActivities = await this.activityRepository.count({
      where: { createdAt: Between(today, tomorrow) },
    });

    // Upcoming activities (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingActivities = await this.activityRepository.count({
      where: {
        startDatetime: Between(new Date(), nextWeek),
        status: ActivityStatus.CONFIRMED,
      },
    });

    // Most popular climbing gyms
    const popularGyms = await this.activityRepository
      .createQueryBuilder('activity')
      .leftJoin('activity.gym', 'gym')
      .select('gym.name', 'gymName')
      .addSelect('COUNT(*)', 'activityCount')
      .groupBy('activity.gymId')
      .orderBy('activityCount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      total,
      active,
      completed,
      cancelled,
      newActivities,
      todayActivities,
      upcomingActivities,
      popularGyms,
    };
  }
}