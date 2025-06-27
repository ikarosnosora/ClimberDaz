import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, MaxLength, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ClimbingFacility } from '../../../climbing-gym/entities/climbing-gym.entity';

export class CreateGymDto {
  @ApiProperty({ description: 'Climbing gym name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Gym address' })
  @IsString()
  @MaxLength(200)
  address: string;

  @ApiProperty({ description: 'City where the gym is located' })
  @IsString()
  @MaxLength(50)
  city: string;

  @ApiPropertyOptional({ description: 'Gym description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Gym phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Gym website URL' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiPropertyOptional({ description: 'Gym email address' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Operating hours' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  operatingHours?: string;

  @ApiPropertyOptional({ description: 'Gym facilities', enum: ClimbingFacility, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ClimbingFacility, { each: true })
  facilities?: ClimbingFacility[];

  @ApiPropertyOptional({ description: 'Gym images URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Average price range' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  priceRange?: string;

  @ApiPropertyOptional({ description: 'Difficulty levels available', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  difficultyLevels?: string[];

  @ApiPropertyOptional({ description: 'Is gym currently active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}