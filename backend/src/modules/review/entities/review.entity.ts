import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Activity } from '../../activity/entities/activity.entity';

export enum ReviewRating {
  GOOD = 'good', // 好评
  BAD = 'bad', // 差评  
  NO_SHOW = 'no_show', // 未出现
  SKIP = 'skip', // 跳过评价
}

@Entity('reviews')
@Index(['activityId'])
@Index(['reviewerId'])
@Index(['revieweeId'])
@Index(['chainId'])
export class Review {
  @ApiProperty({ description: '评价ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '评分', enum: ReviewRating })
  @Column({ type: 'simple-enum', enum: ReviewRating })
  rating: ReviewRating;

  @ApiProperty({ description: '评价内容', required: false })
  @Column('text', { nullable: true })
  comment?: string;

  @ApiProperty({ description: '活动ID' })
  @Column()
  activityId: string;

  @ApiProperty({ description: '评价者ID' })
  @Column()
  reviewerId: string;

  @ApiProperty({ description: '被评价者ID' })
  @Column()
  revieweeId: string;

  @ApiProperty({ description: '评价链ID' })
  @Column()
  chainId: string;

  @ApiProperty({ description: '是否已提交' })
  @Column({ default: false })
  isSubmitted: boolean;

  @ApiProperty({ description: '提交截止时间' })
  @Column()
  submitDeadline: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Activity, (activity) => activity.reviews)
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @ManyToOne(() => User, (user) => user.givenReviews)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @ManyToOne(() => User, (user) => user.receivedReviews)
  @JoinColumn({ name: 'revieweeId' })
  reviewee: User;
} 