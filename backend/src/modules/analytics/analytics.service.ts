import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AnalyticsEvent, EventType } from './entities/analytics-event.entity';
import { UserSession } from './entities/user-session.entity';
import {
  CreateEventDto,
  CreateBatchEventsDto,
} from './dto/create-event.dto';
import {
  QueryAnalyticsDto,
  AnalyticsStatsDto,
  UserBehaviorAnalysisDto,
} from './dto/query-analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly STATS_CACHE_TTL = 60; // 1 minute for stats

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * 创建单个分析事件
   */
  async createEvent(createEventDto: CreateEventDto): Promise<AnalyticsEvent> {
    try {
      const event = this.analyticsEventRepository.create(createEventDto);
      const savedEvent = await this.analyticsEventRepository.save(event);

      // 更新会话信息
      await this.updateSession(createEventDto.sessionId, createEventDto);

      return savedEvent;
    } catch (error) {
      this.logger.error('Failed to create analytics event', error);
      throw error;
    }
  }

  /**
   * 批量创建分析事件
   */
  async createBatchEvents(
    createBatchEventsDto: CreateBatchEventsDto,
  ): Promise<AnalyticsEvent[]> {
    try {
      const events = this.analyticsEventRepository.create(
        createBatchEventsDto.events,
      );
      const savedEvents = await this.analyticsEventRepository.save(events);

      // 批量更新会话信息
      const sessionIds = [
        ...new Set(createBatchEventsDto.events.map((e) => e.sessionId)),
      ];
      await Promise.all(
        sessionIds.map((sessionId) => {
          const sessionEvents = createBatchEventsDto.events.filter(
            (e) => e.sessionId === sessionId,
          );
          return this.updateSession(sessionId, sessionEvents[0]);
        }),
      );

      return savedEvents;
    } catch (error) {
      this.logger.error('Failed to create batch analytics events', error);
      throw error;
    }
  }

  /**
   * 查询分析事件
   */
  async queryEvents(queryDto: QueryAnalyticsDto) {
    const {
      eventType,
      userId,
      startDate,
      endDate,
      pagePath,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.analyticsEventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.user', 'user');

    if (eventType) {
      queryBuilder.andWhere('event.eventType = :eventType', { eventType });
    }

    if (userId) {
      queryBuilder.andWhere('event.userId = :userId', { userId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('event.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (pagePath) {
      queryBuilder.andWhere('event.pagePath LIKE :pagePath', {
        pagePath: `%${pagePath}%`,
      });
    }

    const total = await queryBuilder.getCount();

    const events = await queryBuilder
      .orderBy(`event.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取分析统计数据 (优化版本 - 带缓存)
   */
  async getAnalyticsStats(statsDto: AnalyticsStatsDto) {
    const { days = 7, eventTypes, groupBy = 'day' } = statsDto;
    
    // 生成缓存键
    const cacheKey = `analytics_stats_${days}_${eventTypes?.join(',') || 'all'}_${groupBy}`;
    
    // 尝试从缓存获取
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for analytics stats: ${cacheKey}`);
      return cachedResult;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 优化查询 - 使用索引和批量查询
    const baseQuery = this.analyticsEventRepository
      .createQueryBuilder('event')
      .where('event.createdAt >= :startDate', { startDate });

    if (eventTypes && eventTypes.length > 0) {
      baseQuery.andWhere('event.eventType IN (:...eventTypes)', {
        eventTypes,
      });
    }

    // 并行执行基础统计查询以提高性能
    const [totalEvents, uniqueUsersResult, uniqueSessionsResult] = await Promise.all([
      baseQuery.getCount(),
      baseQuery.clone().select('COUNT(DISTINCT event.userId)', 'count').getRawOne(),
      baseQuery.clone().select('COUNT(DISTINCT event.sessionId)', 'count').getRawOne(),
    ]);

    // 时间序列数据格式优化
    let timeFormat: string;
    switch (groupBy) {
      case 'hour':
        timeFormat = '%Y-%m-%d %H:00:00';
        break;
      case 'week':
        timeFormat = '%Y-%u';
        break;
      case 'month':
        timeFormat = '%Y-%m';
        break;
      default:
        timeFormat = '%Y-%m-%d';
    }

    // 并行执行剩余查询以提高性能
    const [eventTypeStats, timeSeriesData] = await Promise.all([
      // 按事件类型统计
      this.analyticsEventRepository
        .createQueryBuilder('event')
        .select('event.eventType', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .where('event.createdAt >= :startDate', { startDate })
        .andWhere(eventTypes && eventTypes.length > 0 ? 'event.eventType IN (:...eventTypes)' : '1=1', 
          eventTypes && eventTypes.length > 0 ? { eventTypes } : {})
        .groupBy('event.eventType')
        .getRawMany(),
      
      // 时间序列数据
      this.analyticsEventRepository
        .createQueryBuilder('event')
        .select(`strftime('${timeFormat}', event.createdAt)`, 'time')
        .addSelect('COUNT(*)', 'count')
        .where('event.createdAt >= :startDate', { startDate })
        .andWhere(eventTypes && eventTypes.length > 0 ? 'event.eventType IN (:...eventTypes)' : '1=1', 
          eventTypes && eventTypes.length > 0 ? { eventTypes } : {})
        .groupBy(`strftime('${timeFormat}', event.createdAt)`)
        .orderBy('time', 'ASC')
        .getRawMany(),
    ]);

    const result = {
      summary: {
        totalEvents,
        uniqueUsers: parseInt(uniqueUsersResult.count) || 0,
        uniqueSessions: parseInt(uniqueSessionsResult.count) || 0,
        period: `${days} days`,
      },
      eventTypeStats,
      timeSeriesData,
    };

    // 缓存结果
    await this.cacheManager.set(cacheKey, result, this.STATS_CACHE_TTL * 1000);
    this.logger.debug(`Cached analytics stats: ${cacheKey}`);

    return result;
  }

  /**
   * 用户行为分析
   */
  async getUserBehaviorAnalysis(analysisDto: UserBehaviorAnalysisDto) {
    const { userId, days = 30, includeEvents } = analysisDto;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const queryBuilder = this.analyticsEventRepository
      .createQueryBuilder('event')
      .where('event.createdAt >= :startDate', { startDate });

    if (userId) {
      queryBuilder.andWhere('event.userId = :userId', { userId });
    }

    if (includeEvents && includeEvents.length > 0) {
      queryBuilder.andWhere('event.eventType IN (:...includeEvents)', {
        includeEvents,
      });
    }

    // 用户活跃度分析
    const userActivity = await queryBuilder
      .select('event.userId', 'userId')
      .addSelect('COUNT(*)', 'eventCount')
      .addSelect('COUNT(DISTINCT DATE(event.createdAt))', 'activeDays')
      .addSelect('MIN(event.createdAt)', 'firstActivity')
      .addSelect('MAX(event.createdAt)', 'lastActivity')
      .groupBy('event.userId')
      .having('event.userId IS NOT NULL')
      .orderBy('eventCount', 'DESC')
      .getRawMany();

    // 页面访问路径分析
    const pageFlowAnalysis = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select('event.pagePath', 'pagePath')
      .addSelect('COUNT(*)', 'visits')
      .addSelect('COUNT(DISTINCT event.sessionId)', 'uniqueVisitors')
      .where('event.createdAt >= :startDate', { startDate })
      .andWhere('event.eventType = :eventType', {
        eventType: EventType.PAGE_VIEW,
      })
      .andWhere('event.pagePath IS NOT NULL')
      .groupBy('event.pagePath')
      .orderBy('visits', 'DESC')
      .limit(20)
      .getRawMany();

    return {
      userActivity,
      pageFlowAnalysis,
      period: `${days} days`,
    };
  }

  /**
   * 更新用户会话信息
   */
  private async updateSession(
    sessionId: string,
    eventData: CreateEventDto,
  ): Promise<void> {
    try {
      let session = await this.userSessionRepository.findOne({
        where: { sessionId },
      });

      if (!session) {
        // 创建新会话
        session = this.userSessionRepository.create({
          sessionId,
          userId: eventData.userId,
          userAgent: eventData.userAgent,
          ipAddress: eventData.ipAddress,
          deviceInfo: eventData.deviceInfo,
          geoLocation: eventData.geoLocation,
          entryPage: eventData.pagePath,
          referrer: eventData.referrer,
          pageViews: eventData.eventType === EventType.PAGE_VIEW ? 1 : 0,
          eventCount: 1,
        });
      } else {
        // 更新现有会话
        session.eventCount += 1;
        if (eventData.eventType === EventType.PAGE_VIEW) {
          session.pageViews += 1;
        }
        session.exitPage = eventData.pagePath || session.exitPage;
        session.updatedAt = new Date();

        // 计算会话持续时间
        if (session.startTime) {
          session.duration = Math.floor(
            (new Date().getTime() - session.startTime.getTime()) / 1000,
          );
        }
      }

      await this.userSessionRepository.save(session);
    } catch (error) {
      this.logger.error('Failed to update session', error);
      // 不抛出错误，避免影响主要的事件记录功能
    }
  }

  /**
   * 清理过期数据
   */
  async cleanupOldData(retentionDays: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      // 清理过期事件
      const deletedEvents = await this.analyticsEventRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();

      // 清理过期会话
      const deletedSessions = await this.userSessionRepository
        .createQueryBuilder()
        .delete()
        .where('startTime < :cutoffDate', { cutoffDate })
        .execute();

      this.logger.log(
        `Cleaned up ${deletedEvents.affected} events and ${deletedSessions.affected} sessions older than ${retentionDays} days`,
      );
    } catch (error) {
      this.logger.error('Failed to cleanup old data', error);
      throw error;
    }
  }

  /**
   * 获取实时系统指标 (优化版本 - 带缓存)
   */
  async getRealTimeMetrics() {
    const cacheKey = 'real_time_metrics';
    
    // 尝试从缓存获取（30秒缓存）
    const cachedMetrics = await this.cacheManager.get(cacheKey);
    if (cachedMetrics) {
      this.logger.debug('Cache hit for real-time metrics');
      return cachedMetrics;
    }

    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // 并行执行查询以提高性能
      const [onlineUsers, activeConnections] = await Promise.all([
        // 获取当前在线用户数（最近5分钟内有活动的用户）
        this.userSessionRepository
          .createQueryBuilder('session')
          .where('session.isActive = :isActive', { isActive: true })
          .andWhere('session.updatedAt > :fiveMinutesAgo', { fiveMinutesAgo })
          .getCount(),
        
        // 获取活跃连接数
        this.userSessionRepository
          .createQueryBuilder('session')
          .where('session.isActive = :isActive', { isActive: true })
          .getCount(),
      ]);

      // 模拟系统性能指标（在实际应用中，这些应该从系统监控工具获取）
      const now = new Date();
      const responseTime = Math.floor(Math.random() * 100) + 50; // 50-150ms
      const serverLoad = Math.floor(Math.random() * 30) + 20; // 20-50%
      const cpuUsage = Math.floor(Math.random() * 40) + 30; // 30-70%
      const memoryUsage = Math.floor(Math.random() * 50) + 40; // 40-90%
      const errorRate = Math.random() * 2; // 0-2%

      const metrics = {
        onlineUsers,
        activeConnections,
        responseTime,
        serverLoad,
        cpuUsage,
        memoryUsage,
        errorRate: parseFloat(errorRate.toFixed(2)),
        timestamp: now,
      };

      // 缓存结果（30秒）
      await this.cacheManager.set(cacheKey, metrics, 30 * 1000);
      this.logger.debug('Cached real-time metrics');

      return metrics;
    } catch (error) {
      this.logger.error('Failed to get real-time metrics', error);
      throw error;
    }
  }

  /**
   * 获取系统告警
   */
  async getSystemAlerts() {
    try {
      const alerts = [];
      const now = new Date();

      // 检查错误率
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const errorEvents = await this.analyticsEventRepository
        .createQueryBuilder('event')
        .where('event.eventType = :eventType', { eventType: EventType.ERROR })
        .andWhere('event.createdAt > :oneHourAgo', { oneHourAgo })
        .getCount();

      const totalEvents = await this.analyticsEventRepository
        .createQueryBuilder('event')
        .where('event.createdAt > :oneHourAgo', { oneHourAgo })
        .getCount();

      const errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;

      if (errorRate > 5) {
        alerts.push({
          id: `error-rate-${Date.now()}`,
          type: 'error' as const,
          message: `错误率过高: ${errorRate.toFixed(2)}%`,
          timestamp: now,
          resolved: false,
        });
      }

      // 检查响应时间（模拟）
      const avgResponseTime = Math.floor(Math.random() * 200) + 100;
      if (avgResponseTime > 500) {
        alerts.push({
          id: `response-time-${Date.now()}`,
          type: 'warning' as const,
          message: `响应时间过长: ${avgResponseTime}ms`,
          timestamp: now,
          resolved: false,
        });
      }

      // 检查在线用户数异常
      const onlineUsers = await this.userSessionRepository
        .createQueryBuilder('session')
        .where('session.isActive = :isActive', { isActive: true })
        .getCount();

      if (onlineUsers > 1000) {
        alerts.push({
          id: `high-load-${Date.now()}`,
          type: 'info' as const,
          message: `用户访问量激增: ${onlineUsers} 在线用户`,
          timestamp: now,
          resolved: false,
        });
      }

      return alerts;
    } catch (error) {
      this.logger.error('Failed to get system alerts', error);
      throw error;
    }
  }
}