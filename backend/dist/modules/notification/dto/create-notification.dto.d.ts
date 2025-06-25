import { NotificationType } from '../entities/notification.entity';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    relatedId?: string;
    relatedType?: string;
    metadata?: Record<string, any>;
}
