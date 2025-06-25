import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsUUID, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ActivityStatus, ActivityPrivacy, ClimbingType } from '../entities/activity.entity';

export class QueryActivityDto {
  @ApiProperty({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({ description: '活动状态', enum: ActivityStatus, required: false })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiProperty({ description: '攀岩类型', enum: ClimbingType, required: false })
  @IsOptional()
  @IsEnum(ClimbingType)
  climbingType?: ClimbingType;

  @ApiProperty({ description: '岩馆ID', required: false })
  @IsOptional()
  @IsUUID()
  gymId?: string;

  @ApiProperty({ description: '城市', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: '搜索关键词（标题）', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: '开始时间筛选（从）', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @Type(() => Date)
  startDateFrom?: Date;

  @ApiProperty({ description: '开始时间筛选（到）', required: false })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  @Type(() => Date)
  startDateTo?: Date;

  @ApiProperty({ description: '组织者ID', required: false })
  @IsOptional()
  @IsUUID()
  organizerId?: string;

  @ApiProperty({ description: '是否包含私密活动（需要搜索关键词）', default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includePrivate?: boolean = false;
} 