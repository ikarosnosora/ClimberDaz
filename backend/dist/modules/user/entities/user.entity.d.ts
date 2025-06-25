import { Activity } from '../../activity/entities/activity.entity';
import { Review } from '../../review/entities/review.entity';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare enum ClimbingLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
    EXPERT = "expert"
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare class User {
    id: string;
    phone: string;
    password: string;
    nickname: string;
    avatar?: string;
    gender?: Gender;
    birthYear?: number;
    climbingLevel: ClimbingLevel;
    city?: string;
    bio?: string;
    email?: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    organizedActivities: Activity[];
    givenReviews: Review[];
    receivedReviews: Review[];
    organizedCount?: number;
    participatedCount?: number;
    averageRating?: number;
    totalReviews?: number;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
