import { ClimbingLevel, Gender, UserRole } from '../entities/user.entity';
export declare class QueryUserDto {
    page?: number;
    limit?: number;
    climbingLevel?: ClimbingLevel;
    gender?: Gender;
    city?: string;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
}
