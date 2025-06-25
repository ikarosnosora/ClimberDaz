import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum NotificationType {
  ACTIVITY_UPDATE = 'activity_update',        // 活动更新
  ACTIVITY_CANCELLED = 'activity_cancelled',  // 活动取消
  ACTIVITY_COMPLETED = 'activity_completed',  // 活动完成
  NEW_PARTICIPANT = 'new_participant',        // 新参与者
  PARTICIPANT_LEFT = 'participant_left',      // 参与者退出
  REVIEW_REMINDER = 'review_reminder',        // 评价提醒
  NEW_REVIEW = 'new_review',                  // 收到新评价
  SYSTEM_ANNOUNCEMENT = 'system_announcement', // 系统公告
}

@Entity('notifications')
export class Notification {
  @ApiProperty({ description: '通知ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户ID' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ description: '通知类型', enum: NotificationType })
  @Column({
    type: 'varchar',
    length: 50,
  })
  type: NotificationType;

  @ApiProperty({ description: '通知标题' })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ description: '通知内容' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: '是否已读', default: false })
  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @ApiProperty({ description: '已读时间', nullable: true })
  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt: Date;

  @ApiProperty({ description: '关联对象ID', nullable: true })
  @Column({ name: 'related_id', nullable: true })
  relatedId: string;

  @ApiProperty({ description: '关联对象类型', nullable: true })
  @Column({ name: 'related_type', nullable: true })
  relatedType: string;

  @ApiProperty({ description: '额外数据', nullable: true })
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 