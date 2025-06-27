import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { AnalyticsEvent } from './analytics-event.entity';

@Entity('user_sessions')
@Index(['userId', 'startTime'])
@Index(['sessionId'], { unique: true })
@Index(['isActive'])
export class UserSession {
  @ApiProperty({ description: '会话记录ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '会话ID' })
  @Column({ type: 'varchar', length: 255, unique: true })
  sessionId: string;

  @ApiProperty({ description: '用户ID', required: false })
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @ApiProperty({ description: '是否为活跃会话' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: '会话开始时间' })
  @CreateDateColumn()
  startTime: Date;

  @ApiProperty({ description: '会话结束时间' })
  @Column({ type: 'datetime', nullable: true })
  endTime?: Date;

  @ApiProperty({ description: '会话持续时间（秒）' })
  @Column({ type: 'integer', nullable: true })
  duration?: number;

  @ApiProperty({ description: '页面浏览数' })
  @Column({ type: 'integer', default: 0 })
  pageViews: number;

  @ApiProperty({ description: '事件数量' })
  @Column({ type: 'integer', default: 0 })
  eventCount: number;

  @ApiProperty({ description: '用户代理' })
  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'IP地址' })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: '设备信息' })
  @Column({ type: 'json', nullable: true })
  deviceInfo?: {
    platform?: string;
    browser?: string;
    version?: string;
    screenResolution?: string;
    language?: string;
    isMobile?: boolean;
  };

  @ApiProperty({ description: '地理位置信息' })
  @Column({ type: 'json', nullable: true })
  geoLocation?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
    timezone?: string;
  };

  @ApiProperty({ description: '入口页面' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  entryPage?: string;

  @ApiProperty({ description: '退出页面' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  exitPage?: string;

  @ApiProperty({ description: '引用来源' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer?: string;

  @ApiProperty({ description: '最后更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @OneToMany(() => AnalyticsEvent, (event) => event.sessionId)
  events: AnalyticsEvent[];
}