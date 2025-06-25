import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsEmail, Length } from 'class-validator';
import { ClimbingLevel, Gender } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  avatar?: string;

  @ApiProperty({ description: '性别', enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: '出生年份', required: false, minimum: 1900, maximum: 2100 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  birthYear?: number;

  @ApiProperty({ description: '攀岩水平', enum: ClimbingLevel, required: false })
  @IsOptional()
  @IsEnum(ClimbingLevel)
  climbingLevel?: ClimbingLevel;

  @ApiProperty({ description: '所在城市', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  city?: string;

  @ApiProperty({ description: '个人简介', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  @Length(0, 100)
  email?: string;
} 