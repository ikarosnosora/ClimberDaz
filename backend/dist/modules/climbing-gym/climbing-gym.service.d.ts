import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { ClimbingGym } from './entities/climbing-gym.entity';
import { CreateClimbingGymDto } from './dto/create-climbing-gym.dto';
import { UpdateClimbingGymDto } from './dto/update-climbing-gym.dto';
export declare class ClimbingGymService {
    private climbingGymRepository;
    private cacheManager;
    constructor(climbingGymRepository: Repository<ClimbingGym>, cacheManager: Cache);
    create(createClimbingGymDto: CreateClimbingGymDto): Promise<ClimbingGym>;
    findAll(city?: string, isActive?: boolean, limit?: number, offset?: number): Promise<{
        gyms: ClimbingGym[];
        total: number;
    }>;
    findOne(id: string): Promise<ClimbingGym>;
    update(id: string, updateClimbingGymDto: UpdateClimbingGymDto): Promise<ClimbingGym>;
    remove(id: string): Promise<void>;
    findByCity(city: string): Promise<ClimbingGym[]>;
    findNearby(lat: number, lng: number, radiusKm?: number): Promise<ClimbingGym[]>;
    search(keyword: string): Promise<ClimbingGym[]>;
    getActiveCities(): Promise<string[]>;
}
