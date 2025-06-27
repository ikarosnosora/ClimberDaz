import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export enum EventType {
  PAGE_VIEW = 'page_view',
  USER_ACTION = 'user_action',
  ACTIVITY_CREATE = 'activity_create',
  ACTIVITY_JOIN = 'activity_join',
  ACTIVITY_LEAVE = 'activity_leave',
  ACTIVITY_VIEW = 'activity_view',
  SEARCH = 'search',
  BUTTON_CLICK = 'button_click',
  FORM_SUBMIT = 'form_submit',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  REVIEW_CREATE = 'review_create',
  REVIEW_VIEW = 'review_view',
  GYM_VIEW = 'gym_view',
  NOTIFICATION_VIEW = 'notification_view',
}

@Entity('analytics_events')
@Index(['eventType', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['sessionId'])
@Index(['createdAt'])
export class AnalyticsEvent {
  @ApiProperty({ description: '事件ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '事件类型', enum: EventType })
  @Column({
    type: 'varchar',
    length: 50,
    enum: EventType,
  })
  eventType: EventType;

  @ApiProperty({ description: '用户ID', required: false })
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ApiProperty({ description: '会话ID' })
  @Column({ type: 'varchar', length: 255 })
  sessionId: string;

  @ApiProperty({ description: '页面路径' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  pagePath?: string;

  @ApiProperty({ description: '事件属性', type: 'object' })
  @Column({ type: 'json', nullable: true })
  properties?: Record<string, any>;

  @ApiProperty({ description: '用户代理' })
  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'IP地址' })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: '地理位置信息' })
  @Column({ type: 'json', nullable: true })
  geoLocation?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };

  @ApiProperty({ description: '设备信息' })
  @Column({ type: 'json', nullable: true })
  deviceInfo?: {
    platform?: string;
    browser?: string;
    version?: string;
    screenResolution?: string;
    language?: string;
  };

  @ApiProperty({ description: '引用页面' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer?: string;

  @ApiProperty({ description: '持续时间（毫秒）' })
  @Column({ type: 'integer', nullable: true })
  duration?: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;
}