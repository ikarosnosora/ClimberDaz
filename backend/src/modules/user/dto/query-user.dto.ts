import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ClimbingLevel, Gender, UserRole } from '../entities/user.entity';

export class QueryUserDto {
  @ApiProperty({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({ description: '攀岩水平', enum: ClimbingLevel, required: false })
  @IsOptional()
  @IsEnum(ClimbingLevel)
  climbingLevel?: ClimbingLevel;

  @ApiProperty({ description: '性别', enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: '城市', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: '搜索关键词（昵称）', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: '用户角色', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
} 