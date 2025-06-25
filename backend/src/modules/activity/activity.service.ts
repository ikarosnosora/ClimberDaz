import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityStatus, ActivityPrivacy } from './entities/activity.entity';
import { CreateActivityDto, UpdateActivityDto, QueryActivityDto } from './dto';
import { ClimbingGymService } from '../climbing-gym/climbing-gym.service';
import { ReviewService } from '../review/review.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly climbingGymService: ClimbingGymService,
    private readonly reviewService: ReviewService,
  ) {}

  async create(createActivityDto: CreateActivityDto, organizerId: string): Promise<Activity> {
    // Validate gym exists
    const gym = await this.climbingGymService.findOne(createActivityDto.gymId);
    if (!gym) {
      throw new NotFoundException('岩馆不存在');
    }

    // Convert string dates to Date objects for comparison
    const startDate = new Date(createActivityDto.startDatetime);
    const endDate = new Date(createActivityDto.endDatetime);

    // Validate time range
    if (startDate >= endDate) {
      throw new BadRequestException('结束时间必须晚于开始时间');
    }

    // Validate start time is in the future
    if (startDate <= new Date()) {
      throw new BadRequestException('活动开始时间必须在未来');
    }

    const activity = this.activityRepository.create({
      ...createActivityDto,
      organizerId,
      currentParticipants: 1, // Organizer automatically joins
    });

    const savedActivity = await this.activityRepository.save(activity);
    return this.findOne(savedActivity.id);
  }

  async findAll(queryDto: QueryActivityDto): Promise<{ data: Activity[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, includePrivate: _includePrivate = false, ...filters } = queryDto;
    
    const queryBuilder = this.activityRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.organizer', 'organizer')
      .leftJoinAndSelect('activity.gym', 'gym')
      .orderBy('activity.startDatetime', 'ASC');

    // Base filter: exclude cancelled and completed activities unless specifically requested
    if (!filters.status) {
      queryBuilder.andWhere('activity.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [ActivityStatus.CANCELLED, ActivityStatus.COMPLETED]
      });
    }

    // Privacy filter: Handle private activities search logic
    if (search && search.trim()) {
      // If searching, include private activities that match the title
      queryBuilder.andWhere(
        '((activity.privacy = :publicPrivacy) OR (activity.privacy = :privatePrivacy AND activity.title ILIKE :searchTerm))',
        {
          publicPrivacy: ActivityPrivacy.PUBLIC,
          privatePrivacy: ActivityPrivacy.PRIVATE,
          searchTerm: `%${search.trim()}%`
        }
      );
    } else {
      // If not searching, only show public activities
      queryBuilder.andWhere('activity.privacy = :privacy', { privacy: ActivityPrivacy.PUBLIC });
    }

    // Apply other filters
    if (filters.status) {
      queryBuilder.andWhere('activity.status = :status', { status: filters.status });
    }

    if (filters.climbingType) {
      queryBuilder.andWhere('activity.climbingType = :climbingType', { climbingType: filters.climbingType });
    }

    if (filters.gymId) {
      queryBuilder.andWhere('activity.gymId = :gymId', { gymId: filters.gymId });
    }

    if (filters.city) {
      queryBuilder.andWhere('gym.city = :city', { city: filters.city });
    }

    if (filters.organizerId) {
      queryBuilder.andWhere('activity.organizerId = :organizerId', { organizerId: filters.organizerId });
    }

    if (filters.startDateFrom) {
      queryBuilder.andWhere('activity.startDatetime >= :startDateFrom', { startDateFrom: filters.startDateFrom });
    }

    if (filters.startDateTo) {
      queryBuilder.andWhere('activity.startDatetime <= :startDateTo', { startDateTo: filters.startDateTo });
    }

    // Count total
    const total = await queryBuilder.getCount();

    // Apply pagination
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Enrich with computed fields
    const enrichedData = data.map(activity => this.enrichActivity(activity));

    return {
      data: enrichedData,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['organizer', 'gym', 'reviews'],
    });

    if (!activity) {
      throw new NotFoundException('活动不存在');
    }

    return this.enrichActivity(activity);
  }

  async update(id: string, updateActivityDto: UpdateActivityDto, userId: string): Promise<Activity> {
    const activity = await this.findOne(id);

    // Check permissions
    if (activity.organizerId !== userId) {
      throw new ForbiddenException('只有活动组织者可以修改活动');
    }

    // Validate business rules
    if (updateActivityDto.startDatetime && updateActivityDto.endDatetime) {
      if (updateActivityDto.startDatetime >= updateActivityDto.endDatetime) {
        throw new BadRequestException('结束时间必须晚于开始时间');
      }
    }

    if (updateActivityDto.gymId && updateActivityDto.gymId !== activity.gymId) {
      const gym = await this.climbingGymService.findOne(updateActivityDto.gymId);
      if (!gym) {
        throw new NotFoundException('岩馆不存在');
      }
    }

    // Don't allow updating if activity is completed or cancelled
    if (activity.status === ActivityStatus.COMPLETED || activity.status === ActivityStatus.CANCELLED) {
      throw new BadRequestException('已完成或已取消的活动不能修改');
    }

    await this.activityRepository.update(id, updateActivityDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const activity = await this.findOne(id);

    // Check permissions
    if (activity.organizerId !== userId) {
      throw new ForbiddenException('只有活动组织者可以删除活动');
    }

    // Soft delete by marking as cancelled
    await this.activityRepository.update(id, {
      status: ActivityStatus.CANCELLED,
    });
  }

  async joinActivity(id: string, userId: string): Promise<Activity> {
    const activity = await this.findOne(id);

    // Check if user can join
    if (activity.organizerId === userId) {
      throw new BadRequestException('组织者已自动参与活动');
    }

    if (activity.currentParticipants >= activity.maxParticipants) {
      throw new BadRequestException('活动已满员');
    }

    if (activity.status !== ActivityStatus.PENDING) {
      throw new BadRequestException('活动状态不允许报名');
    }

    if (activity.startDatetime <= new Date()) {
      throw new BadRequestException('活动已开始，不能报名');
    }

    // Increment participants count
    await this.activityRepository.update(id, {
      currentParticipants: activity.currentParticipants + 1,
      status: activity.currentParticipants + 1 >= activity.maxParticipants 
        ? ActivityStatus.CONFIRMED 
        : ActivityStatus.PENDING,
    });

    return this.findOne(id);
  }

  async leaveActivity(id: string, userId: string): Promise<Activity> {
    const activity = await this.findOne(id);

    // Check if user can leave
    if (activity.organizerId === userId) {
      throw new BadRequestException('组织者不能退出自己的活动');
    }

    if (activity.currentParticipants <= 1) {
      throw new BadRequestException('当前无其他参与者');
    }

    // Decrement participants count
    await this.activityRepository.update(id, {
      currentParticipants: activity.currentParticipants - 1,
      status: ActivityStatus.PENDING, // Reset to pending when someone leaves
    });

    return this.findOne(id);
  }

  async getMyActivities(userId: string, queryDto: QueryActivityDto): Promise<{ data: Activity[]; total: number; page: number; limit: number }> {
    const modifiedQuery = {
      ...queryDto,
      organizerId: userId,
      includePrivate: true, // Show user's own private activities
    };

    return this.findAll(modifiedQuery);
  }

  async markAsCompleted(id: string, userId: string): Promise<Activity> {
    const activity = await this.findOne(id);

    // Check permissions
    if (activity.organizerId !== userId) {
      throw new ForbiddenException('只有活动组织者可以标记活动完成');
    }

    if (activity.status === ActivityStatus.CANCELLED) {
      throw new BadRequestException('已取消的活动不能标记为完成');
    }

    if (activity.status === ActivityStatus.COMPLETED) {
      throw new BadRequestException('活动已经标记为完成');
    }

    // Update activity status
    await this.activityRepository.update(id, {
      status: ActivityStatus.COMPLETED,
    });

    // Generate review chains for participants
    try {
      const participantIds = await this.getActivityParticipants(id);
      if (participantIds.length >= 2) {
        await this.reviewService.generateReviewChain(id, participantIds);
      }
    } catch (error) {
      console.error('Failed to generate review chains:', error);
      // Don't throw error here - activity completion should succeed even if review chain generation fails
    }

    return this.findOne(id);
  }

  /**
   * 获取活动的所有参与者（包括组织者）
   */
  async getActivityParticipants(activityId: string): Promise<string[]> {
    const activity = await this.findOne(activityId);
    
    // For now, we'll return just the organizer since we don't have a participants table
    // In a full implementation, you would have a separate participants table
    // ARCHITECTURE: Consider adding dedicated participant tracking table for better relational data
    // Current implementation uses simple counter, but separate table would enable better analytics
    return [activity.organizerId];
  }

  private enrichActivity(activity: Activity): Activity {
    // Compute time range display
    const startTime = new Date(activity.startDatetime);
    const endTime = new Date(activity.endDatetime);
    activity.timeRange = `${startTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}-${endTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;

    // Compute location text
    if (activity.gym) {
      activity.locationText = activity.gym.name;
      activity.gymAddress = activity.gym.address;
      activity.gymCity = activity.gym.city;
    }

    // Compute can join status
    activity.canJoin = 
      activity.status === ActivityStatus.PENDING &&
      activity.currentParticipants < activity.maxParticipants &&
      activity.startDatetime > new Date();

    // Compute minutes to start
    activity.minutesToStart = Math.ceil(
      (activity.startDatetime.getTime() - new Date().getTime()) / (1000 * 60)
    );

    return activity;
  }
} 