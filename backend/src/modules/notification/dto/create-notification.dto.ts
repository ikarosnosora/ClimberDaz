import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: '通知类型', enum: NotificationType })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: '通知标题' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '通知内容' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '关联对象ID', required: false })
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiProperty({ description: '关联对象类型', required: false })
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiProperty({ description: '额外数据', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
} 