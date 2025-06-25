import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto';
export declare class NotificationService {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: Notification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    sendActivityNotification(type: NotificationType, userId: string, activityId: string, title: string, content: string): Promise<Notification>;
    sendReviewReminder(userId: string, activityId: string, targetUserName: string): Promise<Notification>;
    sendActivityUpdate(userId: string, activityId: string, message: string): Promise<Notification>;
    sendNewReview(userId: string, reviewerName: string): Promise<Notification>;
}
