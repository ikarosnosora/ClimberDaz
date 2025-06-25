import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ChainStatus {
  PENDING = 'pending', // 等待中
  ACTIVE = 'active', // 进行中
  COMPLETED = 'completed', // 已完成
  EXPIRED = 'expired', // 已过期
}

@Entity('review_chains')
@Index(['activityId'])
@Index(['status'])
export class ReviewChain {
  @ApiProperty({ description: '评价链ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '活动ID' })
  @Column()
  activityId: string;

  @ApiProperty({ description: '评价序列 (用户ID数组)', type: [String] })
  @Column('json')
  userSequence: string[];

  @ApiProperty({ description: '链状态', enum: ChainStatus })
  @Column({ type: 'simple-enum', enum: ChainStatus, default: ChainStatus.PENDING })
  status: ChainStatus;

  @ApiProperty({ description: '触发时间（活动结束后2小时）' })
  @Column()
  triggerTime: Date;

  @ApiProperty({ description: '评价窗口结束时间（48小时后）' })
  @Column()
  expireTime: Date;

  @ApiProperty({ description: '已完成评价数量' })
  @Column({ default: 0 })
  completedCount: number;

  @ApiProperty({ description: '总评价数量' })
  @Column()
  totalCount: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
} 