import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto, UpdateActivityDto, QueryActivityDto } from './dto';
import { ClimbingGymService } from '../climbing-gym/climbing-gym.service';
import { ReviewService } from '../review/review.service';
export declare class ActivityService {
    private readonly activityRepository;
    private readonly climbingGymService;
    private readonly reviewService;
    constructor(activityRepository: Repository<Activity>, climbingGymService: ClimbingGymService, reviewService: ReviewService);
    create(createActivityDto: CreateActivityDto, organizerId: string): Promise<Activity>;
    findAll(queryDto: QueryActivityDto): Promise<{
        data: Activity[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Activity>;
    update(id: string, updateActivityDto: UpdateActivityDto, userId: string): Promise<Activity>;
    remove(id: string, userId: string): Promise<void>;
    joinActivity(id: string, userId: string): Promise<Activity>;
    leaveActivity(id: string, userId: string): Promise<Activity>;
    getMyActivities(userId: string, queryDto: QueryActivityDto): Promise<{
        data: Activity[];
        total: number;
        page: number;
        limit: number;
    }>;
    markAsCompleted(id: string, userId: string): Promise<Activity>;
    getActivityParticipants(activityId: string): Promise<string[]>;
    private enrichActivity;
}
