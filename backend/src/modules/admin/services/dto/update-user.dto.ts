import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Last login timestamp' })
  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date;
}