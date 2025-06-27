import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, IsEnum, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ActivityStatus, ClimbingType } from '../../../activity/entities/activity.entity';

export class CreateActivityDto {
  @ApiProperty({ description: 'Activity title' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'Activity description' })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ description: 'Activity start date and time' })
  @IsDateString()
  startDatetime: string;

  @ApiProperty({ description: 'Activity end date and time' })
  @IsDateString()
  endDatetime: string;

  @ApiProperty({ description: 'Climbing type', enum: ClimbingType })
  @IsEnum(ClimbingType)
  climbingType: ClimbingType;

  @ApiProperty({ description: 'Maximum number of participants' })
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  maxParticipants: number;

  @ApiProperty({ description: 'Organizer user ID' })
  @IsUUID()
  organizerId: string;

  @ApiProperty({ description: 'Climbing gym ID' })
  @IsUUID()
  gymId: string;

  @ApiPropertyOptional({ description: 'Activity difficulty level' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  difficulty?: string;

  @ApiPropertyOptional({ description: 'Activity duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(480) // 8 hours max
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({ description: 'Activity cost per person' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cost?: number;

  @ApiPropertyOptional({ description: 'Activity status', enum: ActivityStatus, default: ActivityStatus.PENDING })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiPropertyOptional({ description: 'Special requirements or notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  requirements?: string;

  @ApiPropertyOptional({ description: 'Equipment needed' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  equipment?: string;

  @ApiPropertyOptional({ description: 'Meeting point details' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  meetingPoint?: string;
}