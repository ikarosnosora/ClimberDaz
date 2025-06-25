import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { Activity } from '../../activity/entities/activity.entity';
import { Review } from '../../review/entities/review.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum ClimbingLevel {
  BEGINNER = 'beginner', // 初学者
  INTERMEDIATE = 'intermediate', // 进阶者
  ADVANCED = 'advanced', // 高级
  EXPERT = 'expert', // 专家
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
@Index(['phone'], { unique: true })
@Index(['email'], { unique: true, where: 'email IS NOT NULL' })
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '手机号' })
  @Column({ length: 11, unique: true })
  phone: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ length: 255 })
  password: string;

  @ApiProperty({ description: '昵称' })
  @Column({ length: 50 })
  nickname: string;

  @ApiProperty({ description: '头像URL', required: false })
  @Column({ length: 500, nullable: true })
  avatar?: string;

  @ApiProperty({ description: '性别', enum: Gender, required: false })
  @Column({ type: 'simple-enum', enum: Gender, nullable: true })
  gender?: Gender;

  @ApiProperty({ description: '出生年份', required: false })
  @Column({ nullable: true })
  birthYear?: number;

  @ApiProperty({ description: '攀岩水平', enum: ClimbingLevel })
  @Column({ type: 'simple-enum', enum: ClimbingLevel, default: ClimbingLevel.BEGINNER })
  climbingLevel: ClimbingLevel;

  @ApiProperty({ description: '所在城市', required: false })
  @Column({ length: 50, nullable: true })
  city?: string;

  @ApiProperty({ description: '个人简介', required: false })
  @Column({ length: 500, nullable: true })
  bio?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @Column({ length: 100, nullable: true, unique: true })
  email?: string;

  @ApiProperty({ description: '用户角色', enum: UserRole })
  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({ description: '是否启用' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: '最后登录时间', required: false })
  @Column({ nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Activity, (activity) => activity.organizer)
  organizedActivities: Activity[];

  @OneToMany(() => Review, (review) => review.reviewer)
  givenReviews: Review[];

  @OneToMany(() => Review, (review) => review.reviewee)
  receivedReviews: Review[];

  // Virtual fields
  @ApiProperty({ description: '组织活动数量' })
  organizedCount?: number;

  @ApiProperty({ description: '参与活动数量' })
  participatedCount?: number;

  @ApiProperty({ description: '平均评分' })
  averageRating?: number;

  @ApiProperty({ description: '总评价数' })
  totalReviews?: number;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
} 