import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getMyNotifications(req: any, page?: number, limit?: number): Promise<{
        notifications: Notification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: any): Promise<Notification>;
    markAllAsRead(req: any): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, req: any): Promise<void>;
}
