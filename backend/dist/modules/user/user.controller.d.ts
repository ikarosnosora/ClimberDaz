import { UserService } from './user.service';
import { UpdateUserDto, QueryUserDto } from './dto';
import { User, UserRole } from './entities/user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<User>;
    updateProfile(updateUserDto: UpdateUserDto, req: any): Promise<User>;
    getUserStats(req: any): Promise<{
        organizedCount: number;
        participatedCount: number;
        averageRating: number;
        totalReviews: number;
        joinDate: Date;
    }>;
    searchUsers(query: string, limit?: number): Promise<User[]>;
    findAll(queryDto: QueryUserDto): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<User>;
    getOtherUserStats(id: string): Promise<{
        organizedCount: number;
        participatedCount: number;
        averageRating: number;
        totalReviews: number;
        joinDate: Date;
    }>;
    deactivateUser(id: string): Promise<User>;
    activateUser(id: string): Promise<User>;
    changeUserRole(id: string, role: UserRole): Promise<User>;
}
