import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * 创建通知
   */
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('通知不存在');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (result.affected === 0) {
      throw new Error('通知不存在');
    }
  }

  /**
   * 发送活动相关通知
   */
  async sendActivityNotification(
    type: NotificationType,
    userId: string,
    activityId: string,
    title: string,
    content: string,
  ): Promise<Notification> {
    return this.createNotification({
      type,
      userId,
      title,
      content,
      relatedId: activityId,
      relatedType: 'activity',
    });
  }

  /**
   * 发送评价提醒通知
   */
  async sendReviewReminder(userId: string, activityId: string, targetUserName: string): Promise<Notification> {
    return this.sendActivityNotification(
      NotificationType.REVIEW_REMINDER,
      userId,
      activityId,
      '评价提醒',
      `请对用户 ${targetUserName} 进行评价`,
    );
  }

  /**
   * 发送活动状态更新通知
   */
  async sendActivityUpdate(userId: string, activityId: string, message: string): Promise<Notification> {
    return this.sendActivityNotification(
      NotificationType.ACTIVITY_UPDATE,
      userId,
      activityId,
      '活动更新',
      message,
    );
  }

  /**
   * 发送新评价通知
   */
  async sendNewReview(userId: string, reviewerName: string): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.NEW_REVIEW,
      userId,
      title: '收到新评价',
      content: `${reviewerName} 对您进行了评价`,
      relatedType: 'review',
    });
  }
} 