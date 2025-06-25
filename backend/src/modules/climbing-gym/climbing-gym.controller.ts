import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ClimbingGymService } from './climbing-gym.service';
import { CreateClimbingGymDto } from './dto/create-climbing-gym.dto';
import { UpdateClimbingGymDto } from './dto/update-climbing-gym.dto';
import { ClimbingGym } from './entities/climbing-gym.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('climbing-gyms')
@Controller('climbing-gyms')
export class ClimbingGymController {
  constructor(private readonly climbingGymService: ClimbingGymService) {}

  @Post()
  @ApiOperation({ summary: '创建岩馆 (仅管理员)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '岩馆创建成功', type: ClimbingGym })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createClimbingGymDto: CreateClimbingGymDto): Promise<ClimbingGym> {
    return this.climbingGymService.create(createClimbingGymDto);
  }

  @Get()
  @ApiOperation({ summary: '获取岩馆列表' })
  @ApiQuery({ name: 'city', required: false, description: '城市筛选' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量', type: Number })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '岩馆列表获取成功',
    schema: {
      type: 'object',
      properties: {
        gyms: { type: 'array', items: { $ref: '#/components/schemas/ClimbingGym' } },
        total: { type: 'number' }
      }
    }
  })
  findAll(
    @Query('city') city?: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    return this.climbingGymService.findAll(city, true, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Get('cities')
  @ApiOperation({ summary: '获取有岩馆的城市列表' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: '城市列表获取成功',
    type: [String]
  })
  getActiveCities(): Promise<string[]> {
    return this.climbingGymService.getActiveCities();
  }

  @Get('search')
  @ApiOperation({ summary: '搜索岩馆' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  @ApiResponse({ status: HttpStatus.OK, description: '搜索结果', type: [ClimbingGym] })
  search(@Query('keyword') keyword: string): Promise<ClimbingGym[]> {
    return this.climbingGymService.search(keyword);
  }

  @Get('nearby')
  @ApiOperation({ summary: '获取附近岩馆' })
  @ApiQuery({ name: 'lat', required: true, description: '纬度', type: Number })
  @ApiQuery({ name: 'lng', required: true, description: '经度', type: Number })
  @ApiQuery({ name: 'radius', required: false, description: '搜索半径(km)', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: '附近岩馆列表', type: [ClimbingGym] })
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string = '10',
  ): Promise<ClimbingGym[]> {
    return this.climbingGymService.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius) || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取岩馆详情' })
  @ApiResponse({ status: HttpStatus.OK, description: '岩馆详情获取成功', type: ClimbingGym })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '岩馆不存在' })
  findOne(@Param('id') id: string): Promise<ClimbingGym> {
    return this.climbingGymService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新岩馆信息 (仅管理员)' })
  @ApiResponse({ status: HttpStatus.OK, description: '岩馆更新成功', type: ClimbingGym })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '岩馆不存在' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() updateClimbingGymDto: UpdateClimbingGymDto,
  ): Promise<ClimbingGym> {
    return this.climbingGymService.update(id, updateClimbingGymDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除岩馆 (仅管理员)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '岩馆删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '岩馆不存在' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.climbingGymService.remove(id);
  }
} 