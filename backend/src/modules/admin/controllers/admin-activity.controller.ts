import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminActivityService } from '../services/admin-activity.service';
import { CreateActivityDto } from '../services/dto/create-activity.dto';
import { UpdateActivityDto } from '../services/dto/update-activity.dto';
import { ActivityQueryDto } from '../services/dto/activity-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ActivityStatus } from '../../activity/entities/activity.entity';

@ApiTags('Admin - Activity Management')
@Controller('admin/activities')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminActivityController {
  constructor(private readonly adminActivityService: AdminActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Activity created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Creator or climbing gym not found',
  })
  async create(@Body() createActivityDto: CreateActivityDto) {
    return await this.adminActivityService.create(createActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activities retrieved successfully',
  })
  async findAll(@Query() query: ActivityQueryDto) {
    return await this.adminActivityService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get activity statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity statistics retrieved successfully',
  })
  async getActivityStats() {
    return await this.adminActivityService.getActivityStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Activity not found',
  })
  async findOne(@Param('id') id: string) {
    return await this.adminActivityService.findOne(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get activity analytics data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity analytics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Activity not found',
  })
  async getActivityAnalytics(@Param('id') id: string) {
    return await this.adminActivityService.getActivityAnalytics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Activity not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return await this.adminActivityService.update(id, updateActivityDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update activity status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity status updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Activity not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ActivityStatus,
  ) {
    return await this.adminActivityService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Activity not found',
  })
  async remove(@Param('id') id: string) {
    await this.adminActivityService.remove(id);
    return { message: 'Activity deleted successfully' };
  }
}