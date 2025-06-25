import { Gender, ClimbingLevel } from '../../user/entities/user.entity';
export declare class RegisterDto {
    phone: string;
    password: string;
    nickname: string;
    email?: string;
    gender?: Gender;
    birthYear?: number;
    climbingLevel?: ClimbingLevel;
    city?: string;
    bio?: string;
}
