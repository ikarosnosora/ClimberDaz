import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto, QueryUserDto } from './dto';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findById(id: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(queryDto: QueryUserDto): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateLastLogin(id: string): Promise<void>;
    deactivate(id: string): Promise<User>;
    activate(id: string): Promise<User>;
    changeRole(id: string, role: UserRole): Promise<User>;
    getUserStats(id: string): Promise<{
        organizedCount: number;
        participatedCount: number;
        averageRating: number;
        totalReviews: number;
        joinDate: Date;
    }>;
    searchUsers(query: string, limit?: number): Promise<User[]>;
    private enrichUserStats;
}
