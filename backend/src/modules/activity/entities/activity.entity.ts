import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { ClimbingGym } from '../../climbing-gym/entities/climbing-gym.entity';
import { Review } from '../../review/entities/review.entity';

export enum ActivityStatus {
  PENDING = 'pending', // 等待参与者
  CONFIRMED = 'confirmed', // 已确认
  CANCELLED = 'cancelled', // 已取消
  COMPLETED = 'completed', // 已完成
}

export enum ActivityPrivacy {
  PUBLIC = 'public', // 公开
  PRIVATE = 'private', // 私密（仅通过标题搜索可发现）
}

export enum ClimbingType {
  BOULDERING = 'bouldering', // 抱石
  TOP_ROPE = 'top_rope', // 顶绳
  LEAD_CLIMBING = 'lead_climbing', // 先锋
  MIXED = 'mixed', // 混合
}

@Entity('activities')
@Index(['status', 'privacy'])
@Index(['startDatetime', 'endDatetime'])
@Index(['organizerId'])
@Index(['gymId'])
export class Activity {
  @ApiProperty({ description: '活动ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '活动标题' })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({ description: '活动描述', required: false })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ description: '开始时间' })
  @Column()
  startDatetime: Date;

  @ApiProperty({ description: '结束时间' })
  @Column()
  endDatetime: Date;

  @ApiProperty({ description: '攀岩类型', enum: ClimbingType })
  @Column({ type: 'simple-enum', enum: ClimbingType })
  climbingType: ClimbingType;

  @ApiProperty({ description: '最大参与人数' })
  @Column()
  maxParticipants: number;

  @ApiProperty({ description: '当前参与人数' })
  @Column({ default: 0 })
  currentParticipants: number;

  @ApiProperty({ description: '活动状态', enum: ActivityStatus })
  @Column({ type: 'simple-enum', enum: ActivityStatus, default: ActivityStatus.PENDING })
  status: ActivityStatus;

  @ApiProperty({ description: '隐私设置', enum: ActivityPrivacy })
  @Column({ type: 'simple-enum', enum: ActivityPrivacy, default: ActivityPrivacy.PUBLIC })
  privacy: ActivityPrivacy;

  @ApiProperty({ description: '费用说明', required: false })
  @Column({ length: 200, nullable: true })
  costInfo?: string;

  @ApiProperty({ description: '注意事项', required: false })
  @Column('text', { nullable: true })
  notes?: string;

  @ApiProperty({ description: '组织者ID' })
  @Column()
  organizerId: string;

  @ApiProperty({ description: '岩馆ID' })
  @Column()
  gymId: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.organizedActivities)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @ManyToOne(() => ClimbingGym, (gym) => gym.activities)
  @JoinColumn({ name: 'gymId' })
  gym: ClimbingGym;

  @OneToMany(() => Review, (review) => review.activity)
  reviews: Review[];

  // Virtual fields (computed from gym relation)
  @ApiProperty({ description: '岩馆名称' })
  locationText?: string;

  @ApiProperty({ description: '岩馆地址' })
  gymAddress?: string;

  @ApiProperty({ description: '岩馆城市' })
  gymCity?: string;

  @ApiProperty({ description: '时间范围显示' })
  timeRange?: string;

  @ApiProperty({ description: '是否可以参加' })
  canJoin?: boolean;

  @ApiProperty({ description: '距离活动开始时间（分钟）' })
  minutesToStart?: number;
} 