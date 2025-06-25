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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateActivityDto, QueryActivityDto } from './dto';
import { Activity } from './entities/activity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('活动管理')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({ summary: '创建活动' })
  @ApiResponse({ status: 201, description: '活动创建成功', type: Activity })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '岩馆不存在' })
  async create(@Body() createActivityDto: CreateActivityDto, @Request() req): Promise<Activity> {
    return this.activityService.create(createActivityDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: '获取活动列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'status', required: false, description: '活动状态' })
  @ApiQuery({ name: 'climbingType', required: false, description: '攀岩类型' })
  @ApiQuery({ name: 'gymId', required: false, description: '岩馆ID' })
  @ApiQuery({ name: 'city', required: false, description: '城市' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'startDateFrom', required: false, description: '开始时间筛选（从）' })
  @ApiQuery({ name: 'startDateTo', required: false, description: '开始时间筛选（到）' })
  @ApiQuery({ name: 'organizerId', required: false, description: '组织者ID' })
  async findAll(@Query() queryDto: QueryActivityDto) {
    console.log('[ActivityController] GET /activities called with query:', queryDto);
    return this.activityService.findAll(queryDto);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的活动' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyActivities(@Query() queryDto: QueryActivityDto, @Request() req) {
    return this.activityService.getMyActivities(req.user.userId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取活动详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Activity })
  @ApiResponse({ status: 404, description: '活动不存在' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async findOne(@Param('id') id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新活动' })
  @ApiResponse({ status: 200, description: '更新成功', type: Activity })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '活动不存在' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Request() req,
  ): Promise<Activity> {
    return this.activityService.update(id, updateActivityDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除活动' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '活动不存在' })
  @ApiParam({ name: 'id', description: '活动ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.activityService.remove(id, req.user.userId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: '参加活动' })
  @ApiResponse({ status: 200, description: '参加成功', type: Activity })
  @ApiResponse({ status: 400, description: '不能参加活动（已满员、已开始等）' })
  @ApiResponse({ status: 404, description: '活动不存在' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async joinActivity(@Param('id') id: string, @Request() req): Promise<Activity> {
    return this.activityService.joinActivity(id, req.user.userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: '退出活动' })
  @ApiResponse({ status: 200, description: '退出成功', type: Activity })
  @ApiResponse({ status: 400, description: '不能退出活动' })
  @ApiResponse({ status: 404, description: '活动不存在' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async leaveActivity(@Param('id') id: string, @Request() req): Promise<Activity> {
    return this.activityService.leaveActivity(id, req.user.userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '标记活动完成' })
  @ApiResponse({ status: 200, description: '标记成功', type: Activity })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '活动不存在' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async markAsCompleted(@Param('id') id: string, @Request() req): Promise<Activity> {
    return this.activityService.markAsCompleted(id, req.user.userId);
  }
} 