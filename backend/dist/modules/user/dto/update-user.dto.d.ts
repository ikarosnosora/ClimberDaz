import { ClimbingLevel, Gender } from '../entities/user.entity';
export declare class UpdateUserDto {
    nickname?: string;
    avatar?: string;
    gender?: Gender;
    birthYear?: number;
    climbingLevel?: ClimbingLevel;
    city?: string;
    bio?: string;
    email?: string;
}
