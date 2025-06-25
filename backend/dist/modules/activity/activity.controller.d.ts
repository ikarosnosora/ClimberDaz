import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateActivityDto, QueryActivityDto } from './dto';
import { Activity } from './entities/activity.entity';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    create(createActivityDto: CreateActivityDto, req: any): Promise<Activity>;
    findAll(queryDto: QueryActivityDto): Promise<{
        data: Activity[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMyActivities(queryDto: QueryActivityDto, req: any): Promise<{
        data: Activity[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Activity>;
    update(id: string, updateActivityDto: UpdateActivityDto, req: any): Promise<Activity>;
    remove(id: string, req: any): Promise<void>;
    joinActivity(id: string, req: any): Promise<Activity>;
    leaveActivity(id: string, req: any): Promise<Activity>;
    markAsCompleted(id: string, req: any): Promise<Activity>;
}
