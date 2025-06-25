import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewChainDto {
  @ApiProperty({ description: '活动ID' })
  @IsNotEmpty()
  @IsString()
  activityId: string;

  @ApiProperty({ 
    description: '参与者用户ID列表',
    type: [String],
    example: ['user1', 'user2', 'user3', 'user4']
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  participantIds: string[];
} 