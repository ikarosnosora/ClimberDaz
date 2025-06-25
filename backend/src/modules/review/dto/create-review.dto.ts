import { IsNotEmpty, IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReviewRating } from '../entities/review.entity';

export class CreateReviewDto {
  @ApiProperty({ description: '活动ID' })
  @IsNotEmpty()
  @IsString()
  activityId: string;

  @ApiProperty({ description: '被评价用户ID' })
  @IsNotEmpty()
  @IsString()
  targetId: string;

  @ApiProperty({ 
    description: '评价类型', 
    enum: ReviewRating,
    example: ReviewRating.GOOD 
  })
  @IsNotEmpty()
  @IsEnum(ReviewRating)
  reviewType: ReviewRating;

  @ApiProperty({ 
    description: '评价备注', 
    required: false,
    maxLength: 200 
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  comment?: string;
} 