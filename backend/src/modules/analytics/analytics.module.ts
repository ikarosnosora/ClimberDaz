import { Module } from '@nestjs/common';
import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { UserSession } from './entities/user-session.entity';
import { databaseOptimizationConfig } from '../../config/database-optimization.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsEvent, UserSession]),
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 100, // Maximum number of items in cache
      ...databaseOptimizationConfig.cache,
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}