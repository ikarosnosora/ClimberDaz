import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import {
  CreateEventDto,
  CreateBatchEventsDto,
} from './dto/create-event.dto';
import {
  QueryAnalyticsDto,
  AnalyticsStatsDto,
  UserBehaviorAnalysisDto,
} from './dto/query-analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AnalyticsEvent } from './entities/analytics-event.entity';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建分析事件' })
  @ApiResponse({
    status: 201,
    description: '事件创建成功',
    type: AnalyticsEvent,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: Request,
  ): Promise<AnalyticsEvent> {
    try {
      // 自动填充IP地址和用户代理
      if (!createEventDto.ipAddress) {
        createEventDto.ipAddress = this.getClientIp(req);
      }
      if (!createEventDto.userAgent) {
        createEventDto.userAgent = req.headers['user-agent'];
      }

      return await this.analyticsService.createEvent(createEventDto);
    } catch (error) {
      this.logger.error('Failed to create analytics event', error);
      throw error;
    }
  }

  @Post('events/batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '批量创建分析事件' })
  @ApiResponse({
    status: 201,
    description: '批量事件创建成功',
    type: [AnalyticsEvent],
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createBatchEvents(
    @Body() createBatchEventsDto: CreateBatchEventsDto,
    @Req() req: Request,
  ): Promise<AnalyticsEvent[]> {
    try {
      // 为所有事件自动填充IP地址和用户代理
      const clientIp = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];

      createBatchEventsDto.events.forEach((event) => {
        if (!event.ipAddress) {
          event.ipAddress = clientIp;
        }
        if (!event.userAgent) {
          event.userAgent = userAgent;
        }
      });

      return await this.analyticsService.createBatchEvents(
        createBatchEventsDto,
      );
    } catch (error) {
      this.logger.error('Failed to create batch analytics events', error);
      throw error;
    }
  }

  @Get('events')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '查询分析事件（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async queryEvents(@Query() queryDto: QueryAnalyticsDto) {
    return await this.analyticsService.queryEvents(queryDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取分析统计数据（管理员）' })
  @ApiResponse({ status: 200, description: '统计数据获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getAnalyticsStats(@Query() statsDto: AnalyticsStatsDto) {
    return await this.analyticsService.getAnalyticsStats(statsDto);
  }

  @Get('user-behavior')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户行为分析（管理员）' })
  @ApiResponse({ status: 200, description: '用户行为分析数据获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getUserBehaviorAnalysis(
    @Query() analysisDto: UserBehaviorAnalysisDto,
  ) {
    return await this.analyticsService.getUserBehaviorAnalysis(analysisDto);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取管理员仪表板数据' })
  @ApiResponse({ status: 200, description: '仪表板数据获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getDashboardData() {
    try {
      // 获取最近7天的统计数据
      const weeklyStats = await this.analyticsService.getAnalyticsStats({
        days: 7,
        groupBy: 'day',
      });

      // 获取最近30天的用户行为分析
      const userBehavior = await this.analyticsService.getUserBehaviorAnalysis({
        days: 30,
      });

      // 获取今日实时数据
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayStats = await this.analyticsService.getAnalyticsStats({
        days: 1,
        groupBy: 'hour',
      });

      return {
        weeklyStats,
        userBehavior,
        todayStats,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard data', error);
      throw error;
    }
  }

  @Post('cleanup')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '清理过期数据（管理员）' })
  @ApiResponse({ status: 200, description: '数据清理成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiQuery({
    name: 'retentionDays',
    required: false,
    description: '数据保留天数，默认90天',
    type: Number,
  })
  async cleanupOldData(@Query('retentionDays') retentionDays?: number) {
    try {
      await this.analyticsService.cleanupOldData(retentionDays || 90);
      return {
        success: true,
        message: `Successfully cleaned up data older than ${retentionDays || 90} days`,
      };
    } catch (error) {
      this.logger.error('Failed to cleanup old data', error);
      throw error;
    }
  }

  @Get('real-time-metrics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取实时系统指标（管理员）' })
  @ApiResponse({ status: 200, description: '实时指标获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getRealTimeMetrics() {
    try {
      const metrics = await this.analyticsService.getRealTimeMetrics();
      return metrics;
    } catch (error) {
      this.logger.error('Failed to get real-time metrics', error);
      throw error;
    }
  }

  @Get('system-alerts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取系统告警（管理员）' })
  @ApiResponse({ status: 200, description: '系统告警获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getSystemAlerts() {
    try {
      const alerts = await this.analyticsService.getSystemAlerts();
      return alerts;
    } catch (error) {
      this.logger.error('Failed to get system alerts', error);
      throw error;
    }
  }

  /**
   * 获取客户端真实IP地址
   */
  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      ''
    );
  }
}