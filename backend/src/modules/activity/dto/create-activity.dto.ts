import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  Min, 
  Max, 
  IsUUID, 
  IsDateString,
  Length,
  IsDate
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ActivityPrivacy, ClimbingType } from '../entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ description: '活动标题', example: '周末抱石约起来！' })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({ description: '活动描述', required: false, example: '寻找攀岩搭子，一起提升技术！' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: '开始时间', example: '2025-07-15T14:00:00.000Z' })
  @IsDateString()
  startDatetime: string;

  @ApiProperty({ description: '结束时间', example: '2025-07-15T16:00:00.000Z' })
  @IsDateString()
  endDatetime: string;

  @ApiProperty({ description: '攀岩类型', enum: ClimbingType, example: ClimbingType.BOULDERING })
  @IsEnum(ClimbingType)
  climbingType: ClimbingType;

  @ApiProperty({ description: '最大参与人数', example: 4, minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  maxParticipants: number;

  @ApiProperty({ description: '隐私设置', enum: ActivityPrivacy, default: ActivityPrivacy.PUBLIC })
  @IsOptional()
  @IsEnum(ActivityPrivacy)
  privacy?: ActivityPrivacy = ActivityPrivacy.PUBLIC;

  @ApiProperty({ description: '费用说明', required: false, example: 'AA制，预计每人50元' })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  costInfo?: string;

  @ApiProperty({ description: '注意事项', required: false, example: '请带好攀岩鞋和粉袋' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiProperty({ description: '岩馆ID', example: 'uuid-string' })
  @IsUUID()
  gymId: string;
} 