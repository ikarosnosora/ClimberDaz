import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, IsNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Gender, ClimbingLevel } from '../../../user/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'User phone number' })
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  phone: string;

  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ description: 'User nickname' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nickname: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'User gender', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Birth year' })
  @IsOptional()
  @IsNumber()
  birthYear?: number;

  @ApiPropertyOptional({ description: 'Climbing level', enum: ClimbingLevel })
  @IsOptional()
  @IsEnum(ClimbingLevel)
  climbingLevel?: ClimbingLevel;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'User bio' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'User role', enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Is user active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}