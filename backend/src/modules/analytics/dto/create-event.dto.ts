import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  IsNumber,
  IsUUID,
  MaxLength,
  IsUrl,
  Min,
} from 'class-validator';
import { EventType } from '../entities/analytics-event.entity';

export class CreateEventDto {
  @ApiProperty({ description: '事件类型', enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: '会话ID' })
  @IsString()
  @MaxLength(255)
  sessionId: string;

  @ApiPropertyOptional({ description: '页面路径' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pagePath?: string;

  @ApiPropertyOptional({ description: '事件属性' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @ApiPropertyOptional({ description: '用户代理' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'IP地址' })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiPropertyOptional({ description: '地理位置信息' })
  @IsOptional()
  @IsObject()
  geoLocation?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };

  @ApiPropertyOptional({ description: '设备信息' })
  @IsOptional()
  @IsObject()
  deviceInfo?: {
    platform?: string;
    browser?: string;
    version?: string;
    screenResolution?: string;
    language?: string;
  };

  @ApiPropertyOptional({ description: '引用页面' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  referrer?: string;

  @ApiPropertyOptional({ description: '持续时间（毫秒）' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}

export class CreateBatchEventsDto {
  @ApiProperty({ description: '事件列表', type: [CreateEventDto] })
  events: CreateEventDto[];
}