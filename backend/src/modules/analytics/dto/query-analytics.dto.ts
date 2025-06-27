import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsString,
  IsNumber,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EventType } from '../entities/analytics-event.entity';

export class QueryAnalyticsDto {
  @ApiPropertyOptional({ description: '事件类型', enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '页面路径' })
  @IsOptional()
  @IsString()
  pagePath?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方向', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class AnalyticsStatsDto {
  @ApiPropertyOptional({ description: '统计时间范围（天）', default: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  days?: number = 7;

  @ApiPropertyOptional({ description: '事件类型列表' })
  @IsOptional()
  @IsArray()
  @IsEnum(EventType, { each: true })
  eventTypes?: EventType[];

  @ApiPropertyOptional({ description: '分组维度' })
  @IsOptional()
  @IsString()
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}

export class UserBehaviorAnalysisDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: '分析时间范围（天）', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  days?: number = 30;

  @ApiPropertyOptional({ description: '包含的事件类型' })
  @IsOptional()
  @IsArray()
  @IsEnum(EventType, { each: true })
  includeEvents?: EventType[];
}