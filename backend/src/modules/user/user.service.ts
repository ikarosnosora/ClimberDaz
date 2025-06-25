import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto, QueryUserDto } from './dto';
import { ReviewRating } from '../review/entities/review.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['organizedActivities', 'givenReviews', 'receivedReviews']
    });
    
    if (user) {
      return this.enrichUserStats(user);
    }
    
    return null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(queryDto: QueryUserDto): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, ...filters } = queryDto;
    
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.organizedActivities', 'activities')
      .leftJoinAndSelect('user.receivedReviews', 'reviews')
      .where('user.isActive = :isActive', { isActive: true });

    // Apply search filter
    if (search && search.trim()) {
      queryBuilder.andWhere('user.nickname ILIKE :search', { search: `%${search.trim()}%` });
    }

    // Apply other filters
    if (filters.climbingLevel) {
      queryBuilder.andWhere('user.climbingLevel = :climbingLevel', { climbingLevel: filters.climbingLevel });
    }

    if (filters.gender) {
      queryBuilder.andWhere('user.gender = :gender', { gender: filters.gender });
    }

    if (filters.city) {
      queryBuilder.andWhere('user.city = :city', { city: filters.city });
    }

    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActiveFilter', { isActiveFilter: filters.isActive });
    }

    // Order by creation date
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Count total
    const total = await queryBuilder.getCount();

    // Apply pagination
    const users = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Enrich with statistics
    const enrichedUsers = users.map(user => this.enrichUserStats(user));

    return {
      data: enrichedUsers,
      total,
      page,
      limit,
    };
  }

  async create(userData: Partial<User>): Promise<User> {
    // Check if phone already exists
    if (userData.phone) {
      const existingUser = await this.findByPhone(userData.phone);
      if (existingUser) {
        throw new ConflictException('手机号已存在');
      }
    }

    // Check if email already exists
    if (userData.email) {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('邮箱已存在');
      }
    }

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);
    
    return this.enrichUserStats(savedUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // Check email uniqueness if updating email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('邮箱已被其他用户使用');
      }
    }

    // Update user
    await this.userRepository.update(id, updateUserDto);
    
    // Return updated user
    const updatedUser = await this.findById(id);
    return updatedUser!;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { 
      lastLoginAt: new Date() 
    });
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.update(id, { isActive: false });
    
    const updatedUser = await this.findById(id);
    return updatedUser!;
  }

  async activate(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.update(id, { isActive: true });
    
    const updatedUser = await this.findById(id);
    return updatedUser!;
  }

  async changeRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.userRepository.update(id, { role });
    
    const updatedUser = await this.findById(id);
    return updatedUser!;
  }

  async getUserStats(id: string): Promise<{
    organizedCount: number;
    participatedCount: number;
    averageRating: number;
    totalReviews: number;
    joinDate: Date;
  }> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organizedActivities', 'receivedReviews']
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const organizedCount = user.organizedActivities?.length || 0;
    const totalReviews = user.receivedReviews?.length || 0;
    
    // Calculate average rating from received reviews
    let averageRating = 0;
    if (totalReviews > 0) {
      const positiveReviews = user.receivedReviews.filter(review => review.rating === ReviewRating.GOOD).length;
      averageRating = (positiveReviews / totalReviews) * 100; // Percentage of positive reviews
    }

    return {
      organizedCount,
      participatedCount: 0, // This would require a more complex query to count participated activities
      averageRating,
      totalReviews,
      joinDate: user.createdAt,
    };
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const users = await this.userRepository.find({
      where: [
        { nickname: Like(`%${query.trim()}%`) },
        { phone: Like(`%${query.trim()}%`) }
      ],
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return users.map(user => this.enrichUserStats(user));
  }

  private enrichUserStats(user: User): User {
    // Calculate organized activities count
    user.organizedCount = user.organizedActivities?.length || 0;
    
    // Calculate total reviews
    user.totalReviews = user.receivedReviews?.length || 0;
    
    // Calculate average rating (percentage of positive reviews)
    if (user.totalReviews > 0) {
      const positiveReviews = user.receivedReviews?.filter(review => review.rating === ReviewRating.GOOD).length || 0;
      user.averageRating = Math.round((positiveReviews / user.totalReviews) * 100);
    } else {
      user.averageRating = 0;
    }

    // Participated count would require a more complex query
    user.participatedCount = 0;

    return user;
  }
} 