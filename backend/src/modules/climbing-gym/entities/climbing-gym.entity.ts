import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Activity } from '../../activity/entities/activity.entity';

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export enum ClimbingFacility {
  BOULDERING = 'bouldering',
  TOP_ROPE = 'top_rope',
  LEAD_CLIMBING = 'lead_climbing',
  TRAINING_AREA = 'training_area',
  EQUIPMENT_RENTAL = 'equipment_rental',
  SHOWER = 'shower',
  PARKING = 'parking',
}

@Entity('climbing_gyms')
@Index(['city', 'isActive'])
@Index(['lat', 'lng'])
export class ClimbingGym {
  @ApiProperty({ description: '岩馆ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '岩馆名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '地址' })
  @Column({ length: 200 })
  address: string;

  @ApiProperty({ description: '城市' })
  @Column({ length: 50 })
  city: string;

  @ApiProperty({ description: '纬度' })
  @Column('decimal', { precision: 10, scale: 8 })
  lat: number;

  @ApiProperty({ description: '经度' })
  @Column('decimal', { precision: 11, scale: 8 })
  lng: number;

  @ApiProperty({ description: '联系电话', required: false })
  @Column({ length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: '营业时间', required: false })
  @Column('json', { nullable: true })
  businessHours?: BusinessHours;

  @ApiProperty({ description: '设施信息', enum: ClimbingFacility, isArray: true })
  @Column('json', { nullable: true })
  facilities?: ClimbingFacility[];

  @ApiProperty({ description: '岩馆描述', required: false })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ description: '官网链接', required: false })
  @Column({ length: 200, nullable: true })
  website?: string;

  @ApiProperty({ description: '是否启用' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Activity, (activity) => activity.gym)
  activities: Activity[];

  // Virtual fields
  @ApiProperty({ description: '关联活动数量' })
  activityCount?: number;
} 