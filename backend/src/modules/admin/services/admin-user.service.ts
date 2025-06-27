import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, Or } from 'typeorm';
import { User, UserRole } from '../../user/entities/user.entity';
import { AnalyticsEvent } from '../../analytics/entities/analytics-event.entity';
import { UserSession } from '../../analytics/entities/user-session.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AnalyticsEvent)
    private analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
  ) {}

  async findAll(query: UserQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      startDate,
      endDate,
    } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(user.username LIKE :search OR user.email LIKE :search OR user.phone LIKE :search OR user.nickname LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by role
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Filter by active status
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Date range filter
    if (startDate && endDate) {
      queryBuilder.andWhere('user.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['activities', 'reviews'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check for unique constraints
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { phone: createUserDto.phone },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('User with this email, phone, or username already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for unique constraints if updating email or phone
    if (updateUserDto.email || updateUserDto.phone) {
      const conditions = [];
      if (updateUserDto.email) conditions.push({ email: updateUserDto.email });
      if (updateUserDto.phone) conditions.push({ phone: updateUserDto.phone });
      
      const existingUser = await this.userRepository.findOne({
        where: conditions,
      });

      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('User with this email or phone already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async toggleActiveStatus(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return await this.userRepository.save(user);
  }

  async getUserAnalytics(id: string) {
    const user = await this.findOne(id);

    // Get user's analytics events
    const events = await this.analyticsEventRepository.find({
      where: { userId: id },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    // Get user sessions
    const sessions = await this.userSessionRepository.find({
      where: { userId: id },
      order: { startTime: 'DESC' },
      take: 20,
    });

    // Calculate analytics
    const totalEvents = events.length;
    const eventTypes = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    const totalSessions = sessions.length;
    const avgSessionDuration = sessions.reduce((acc, session) => {
      if (session.endTime) {
        return acc + (session.endTime.getTime() - session.startTime.getTime());
      }
      return acc;
    }, 0) / sessions.filter(s => s.endTime).length || 0;

    return {
      user,
      analytics: {
        totalEvents,
        eventTypes,
        totalSessions,
        avgSessionDuration: Math.round(avgSessionDuration / 1000), // in seconds
        recentEvents: events.slice(0, 10),
        recentSessions: sessions.slice(0, 5),
      },
    };
  }

  async getUserStats() {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { isActive: true } });
    const admins = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
    
    // Users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await this.userRepository.count({
      where: { createdAt: Between(thirtyDaysAgo, new Date()) },
    });

    // Users registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayUsers = await this.userRepository.count({
      where: { createdAt: Between(today, tomorrow) },
    });

    return {
      total,
      active,
      inactive: total - active,
      admins,
      newUsers,
      todayUsers,
    };
  }
}