import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ClimbingGym } from './entities/climbing-gym.entity';
import { CreateClimbingGymDto } from './dto/create-climbing-gym.dto';
import { UpdateClimbingGymDto } from './dto/update-climbing-gym.dto';

@Injectable()
export class ClimbingGymService {
  constructor(
    @InjectRepository(ClimbingGym)
    private climbingGymRepository: Repository<ClimbingGym>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createClimbingGymDto: CreateClimbingGymDto): Promise<ClimbingGym> {
    const gym = this.climbingGymRepository.create(createClimbingGymDto);
    return await this.climbingGymRepository.save(gym);
  }

  async findAll(
    city?: string,
    isActive: boolean = true,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ gyms: ClimbingGym[]; total: number }> {
    const queryBuilder = this.climbingGymRepository
      .createQueryBuilder('gym')
      .where('gym.isActive = :isActive', { isActive });

    if (city) {
      queryBuilder.andWhere('gym.city = :city', { city });
    }

    const [gyms, total] = await queryBuilder
      .orderBy('gym.name', 'ASC')
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    return { gyms, total };
  }

  async findOne(id: string): Promise<ClimbingGym> {
    const gym = await this.climbingGymRepository.findOne({
      where: { id },
      relations: ['activities'],
    });

    if (!gym) {
      throw new NotFoundException(`岩馆 ID ${id} 不存在`);
    }
    
    return gym;
  }

  async update(id: string, updateClimbingGymDto: UpdateClimbingGymDto): Promise<ClimbingGym> {
    const gym = await this.findOne(id);
    
    Object.assign(gym, updateClimbingGymDto);
    return await this.climbingGymRepository.save(gym);
  }

  async remove(id: string): Promise<void> {
    const gym = await this.findOne(id);
    
    // Soft delete by setting isActive to false
    gym.isActive = false;
    await this.climbingGymRepository.save(gym);
  }

  async findByCity(city: string): Promise<ClimbingGym[]> {
    const result = await this.findAll(city, true, 100, 0);
    return result.gyms;
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 10,
  ): Promise<ClimbingGym[]> {
    // Simple bounding box calculation (for more precise distance, use PostGIS)
    const latRange = radiusKm / 111; // 1 degree ≈ 111km
    const lngRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    return this.climbingGymRepository.find({
      where: {
        lat: Between(lat - latRange, lat + latRange),
        lng: Between(lng - lngRange, lng + lngRange),
        isActive: true,
      },
      order: { name: 'ASC' },
    });
  }

  async search(keyword: string): Promise<ClimbingGym[]> {
    return this.climbingGymRepository.find({
      where: [
        { name: Like(`%${keyword}%`), isActive: true },
        { address: Like(`%${keyword}%`), isActive: true },
      ],
      order: { name: 'ASC' },
      take: 20,
    });
  }

  async getActiveCities(): Promise<string[]> {
    const cities = await this.climbingGymRepository
      .createQueryBuilder('gym')
      .select('DISTINCT gym.city', 'city')
      .where('gym.isActive = :isActive', { isActive: true })
      .orderBy('gym.city', 'ASC')
      .getRawMany();

    return cities.map(item => item.city);
  }
} 