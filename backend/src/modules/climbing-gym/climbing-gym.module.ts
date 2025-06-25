import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ClimbingGym } from './entities/climbing-gym.entity';
import { ClimbingGymController } from './climbing-gym.controller';
import { ClimbingGymService } from './climbing-gym.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClimbingGym]),
    CacheModule.register(), // Add cache module for this specific module
  ],
  controllers: [ClimbingGymController],
  providers: [ClimbingGymService],
  exports: [ClimbingGymService],
})
export class ClimbingGymModule {} 