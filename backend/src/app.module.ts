import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
// import * as redisStore from 'cache-manager-redis-store';

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ClimbingGymModule } from './modules/climbing-gym/climbing-gym.module';
import { ReviewModule } from './modules/review/review.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';

// Import demo controller
import { DemoController } from './demo.controller';

// Import configuration
// Configuration imports
// import { DatabaseConfig } from './config/database.config';
// import { RedisConfig } from './config/redis.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database - Using better-sqlite3 for development
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'climberdaz.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
      dropSchema: false, // Keep data between restarts
    }),

    // In-memory Cache (simple alternative to Redis for development)
    CacheModule.register({
      ttl: 3600, // 1 hour default TTL
      max: 1000, // Maximum number of items in cache
    }),

    // Bull Queue (temporarily disabled for testing)
    // BullModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useClass: RedisConfig,
    // }),

    // Feature modules - Full database integration
    AuthModule,
    ClimbingGymModule,
    UserModule,
    ActivityModule,
    ReviewModule,
    NotificationModule,
    AnalyticsModule,
    AdminModule,
  ],
  controllers: [DemoController],
  providers: [],
})
export class AppModule {}