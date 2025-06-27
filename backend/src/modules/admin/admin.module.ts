import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ClimbingGym } from '../climbing-gym/entities/climbing-gym.entity';
import { Activity } from '../activity/entities/activity.entity';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import { UserSession } from '../analytics/entities/user-session.entity';
import { Review } from '../review/entities/review.entity';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminGymController } from './controllers/admin-gym.controller';
import { AdminActivityController } from './controllers/admin-activity.controller';
import { AdminUserService } from './services/admin-user.service';
import { AdminGymService } from './services/admin-gym.service';
import { AdminActivityService } from './services/admin-activity.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ClimbingGym,
      Activity,
      AnalyticsEvent,
      UserSession,
      Review,
    ]),
  ],
  controllers: [
    AdminUserController,
    AdminGymController,
    AdminActivityController,
  ],
  providers: [
    AdminUserService,
    AdminGymService,
    AdminActivityService,
  ],
  exports: [
    AdminUserService,
    AdminGymService,
    AdminActivityService,
  ],
})
export class AdminModule {}