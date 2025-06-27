import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { ClimbingGym } from '../../climbing-gym/entities/climbing-gym.entity';
import { Activity, ActivityStatus } from '../../activity/entities/activity.entity';
import { Review } from '../../review/entities/review.entity';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymQueryDto } from './dto/gym-query.dto';

@Injectable()
export class AdminGymService {
  constructor(
    @InjectRepository(ClimbingGym)
    private gymRepository: Repository<ClimbingGym>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async findAll(query: GymQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
    } = query;

    const queryBuilder = this.gymRepository.createQueryBuilder('gym');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(gym.name LIKE :search OR gym.address LIKE :search OR gym.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by city
    if (city) {
      queryBuilder.andWhere('gym.city LIKE :city', { city: `%${city}%` });
    }

    // Filter by active status
    if (isActive !== undefined) {
      queryBuilder.andWhere('gym.isActive = :isActive', { isActive });
    }

    // Date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere('gym.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Sorting
    queryBuilder.orderBy(`gym.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [gyms, total] = await queryBuilder.getManyAndCount();

    return {
      data: gyms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ClimbingGym> {
    const gym = await this.gymRepository.findOne({
      where: { id },
      relations: ['activities', 'reviews'],
    });

    if (!gym) {
      throw new NotFoundException(`Climbing gym with ID ${id} not found`);
    }

    return gym;
  }

  async create(createGymDto: CreateGymDto): Promise<ClimbingGym> {
    // Check if gym with same name and address already exists
    const existingGym = await this.gymRepository.findOne({
      where: {
        name: createGymDto.name,
        address: createGymDto.address,
      },
    });

    if (existingGym) {
      throw new BadRequestException('Climbing gym with this name and address already exists');
    }

    const gym = this.gymRepository.create(createGymDto);
    return await this.gymRepository.save(gym);
  }

  async update(id: string, updateGymDto: UpdateGymDto): Promise<ClimbingGym> {
    const gym = await this.findOne(id);

    // Check for unique constraints if updating name and address
    if (updateGymDto.name && updateGymDto.address) {
      const existingGym = await this.gymRepository.findOne({
        where: {
          name: updateGymDto.name,
          address: updateGymDto.address,
        },
      });

      if (existingGym && existingGym.id !== id) {
        throw new BadRequestException('Climbing gym with this name and address already exists');
      }
    }

    Object.assign(gym, updateGymDto);
    return await this.gymRepository.save(gym);
  }

  async remove(id: string): Promise<void> {
    const gym = await this.findOne(id);
    
    // Check if gym has associated activities
    const activityCount = await this.activityRepository.count({
      where: { gymId: id },
    });

    if (activityCount > 0) {
      throw new BadRequestException(
        `Cannot delete gym with ${activityCount} associated activities. Please remove activities first.`,
      );
    }

    await this.gymRepository.remove(gym);
  }

  async toggleActiveStatus(id: string): Promise<ClimbingGym> {
    const gym = await this.findOne(id);
    gym.isActive = !gym.isActive;
    return await this.gymRepository.save(gym);
  }

  async getGymAnalytics(id: string) {
    const gym = await this.findOne(id);

    // Get activities count
    const totalActivities = await this.activityRepository.count({
      where: { gymId: id },
    });

    const activeActivities = await this.activityRepository.count({
      where: { gymId: id, status: ActivityStatus.CONFIRMED },
    });

    // Get reviews count through activities
    const reviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.activity', 'activity')
      .where('activity.gymId = :gymId', { gymId: id })
      .getMany();

    const totalReviews = reviews.length;
    const averageRating = 0; // Note: Review entity uses enum (EXCELLENT, GOOD, BAD, NO_SHOW, SKIP), not numeric rating

    // Get recent activities
    const recentActivities = await this.activityRepository.find({
      where: { gymId: id },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['organizer'],
    });

    // Get recent reviews through activities
    const recentReviews = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.activity', 'activity')
      .leftJoin('review.reviewer', 'reviewer')
      .where('activity.gymId = :gymId', { gymId: id })
      .orderBy('review.createdAt', 'DESC')
      .take(10)
      .getMany();

    // Activities created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActivitiesCount = await this.activityRepository.count({
      where: {
        gymId: id,
        createdAt: Between(thirtyDaysAgo, new Date()),
      },
    });

    return {
      gym,
      analytics: {
        totalActivities,
        activeActivities,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        recentActivitiesCount,
        recentActivities,
        recentReviews,
      },
    };
  }

  async getGymStats() {
    const total = await this.gymRepository.count();
    const active = await this.gymRepository.count({ where: { isActive: true } });
    
    // Gyms added in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newGyms = await this.gymRepository.count({
      where: { createdAt: Between(thirtyDaysAgo, new Date()) },
    });

    // Get city distribution
    const cityStats = await this.gymRepository
      .createQueryBuilder('gym')
      .select('gym.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .groupBy('gym.city')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      active,
      inactive: total - active,
      newGyms,
      cityDistribution: cityStats,
    };
  }
}