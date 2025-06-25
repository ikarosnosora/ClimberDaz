import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsInt, Length, Matches, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, ClimbingLevel } from '../../user/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
  phone: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @ApiProperty({ description: '昵称', example: '攀岩爱好者' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nickname: string;

  @ApiProperty({ description: '邮箱', example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '性别', enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: '出生年份', example: 1990, required: false })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  birthYear?: number;

  @ApiProperty({ description: '攀岩水平', enum: ClimbingLevel, required: false })
  @IsOptional()
  @IsEnum(ClimbingLevel)
  climbingLevel?: ClimbingLevel;

  @ApiProperty({ description: '所在城市', example: '北京', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  city?: string;

  @ApiProperty({ description: '个人简介', example: '热爱攀岩，寻找搭子', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;
} 