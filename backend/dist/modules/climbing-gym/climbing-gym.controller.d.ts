import { ClimbingGymService } from './climbing-gym.service';
import { CreateClimbingGymDto } from './dto/create-climbing-gym.dto';
import { UpdateClimbingGymDto } from './dto/update-climbing-gym.dto';
import { ClimbingGym } from './entities/climbing-gym.entity';
export declare class ClimbingGymController {
    private readonly climbingGymService;
    constructor(climbingGymService: ClimbingGymService);
    create(createClimbingGymDto: CreateClimbingGymDto): Promise<ClimbingGym>;
    findAll(city?: string, limit?: string, offset?: string): Promise<{
        gyms: ClimbingGym[];
        total: number;
    }>;
    getActiveCities(): Promise<string[]>;
    search(keyword: string): Promise<ClimbingGym[]>;
    findNearby(lat: string, lng: string, radius?: string): Promise<ClimbingGym[]>;
    findOne(id: string): Promise<ClimbingGym>;
    update(id: string, updateClimbingGymDto: UpdateClimbingGymDto): Promise<ClimbingGym>;
    remove(id: string): Promise<void>;
}
