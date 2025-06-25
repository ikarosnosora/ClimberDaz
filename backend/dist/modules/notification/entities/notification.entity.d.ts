import { User } from '../../user/entities/user.entity';
export declare enum NotificationType {
    ACTIVITY_UPDATE = "activity_update",
    ACTIVITY_CANCELLED = "activity_cancelled",
    ACTIVITY_COMPLETED = "activity_completed",
    NEW_PARTICIPANT = "new_participant",
    PARTICIPANT_LEFT = "participant_left",
    REVIEW_REMINDER = "review_reminder",
    NEW_REVIEW = "new_review",
    SYSTEM_ANNOUNCEMENT = "system_announcement"
}
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    isRead: boolean;
    readAt: Date;
    relatedId: string;
    relatedType: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
