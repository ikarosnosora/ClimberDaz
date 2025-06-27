import { IsOptional, IsString, IsDateString, IsNumber, Min, Max, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ActivityQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for activity title, description, or creator username' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by activity status', enum: ['active', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['active', 'completed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by climbing gym ID' })
  @IsOptional()
  @IsUUID()
  gymId?: string;

  @ApiPropertyOptional({ description: 'Filter by organizer ID' })
  @IsOptional()
  @IsUUID()
  organizerId?: string;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  @IsEnum(['createdAt', 'updatedAt', 'date', 'title', 'maxParticipants'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Start date for filtering creation date (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering creation date (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering activity date (ISO string)' })
  @IsOptional()
  @IsDateString()
  activityStartDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering activity date (ISO string)' })
  @IsOptional()
  @IsDateString()
  activityEndDate?: string;
}