import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Length, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClimbingFacility, BusinessHours } from '../entities/climbing-gym.entity';

export class CreateClimbingGymDto {
  @ApiProperty({ description: '岩馆名称', example: '北京攀岩馆' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '地址', example: '北京市朝阳区三里屯路123号' })
  @IsString()
  @Length(1, 200)
  address: string;

  @ApiProperty({ description: '城市', example: '北京' })
  @IsString()
  @Length(1, 50)
  city: string;

  @ApiProperty({ description: '纬度', example: 39.9075 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ description: '经度', example: 116.39723 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiProperty({ description: '联系电话', example: '010-12345678', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @ApiProperty({ 
    description: '营业时间',
    example: {
      monday: '09:00-22:00',
      tuesday: '09:00-22:00',
      wednesday: '09:00-22:00',
      thursday: '09:00-22:00',
      friday: '09:00-22:00',
      saturday: '08:00-23:00',
      sunday: '08:00-23:00'
    },
    required: false
  })
  @IsOptional()
  businessHours?: BusinessHours;

  @ApiProperty({
    description: '设施信息',
    enum: ClimbingFacility,
    isArray: true,
    example: [ClimbingFacility.BOULDERING, ClimbingFacility.TOP_ROPE, ClimbingFacility.PARKING],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ClimbingFacility, { each: true })
  facilities?: ClimbingFacility[];

  @ApiProperty({ description: '岩馆描述', example: '专业攀岩馆，设备齐全', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '官网链接', example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  website?: string;
} 