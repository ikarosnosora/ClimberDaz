"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_entity_1 = require("./entities/activity.entity");
const climbing_gym_service_1 = require("../climbing-gym/climbing-gym.service");
const review_service_1 = require("../review/review.service");
let ActivityService = class ActivityService {
    constructor(activityRepository, climbingGymService, reviewService) {
        this.activityRepository = activityRepository;
        this.climbingGymService = climbingGymService;
        this.reviewService = reviewService;
    }
    async create(createActivityDto, organizerId) {
        const gym = await this.climbingGymService.findOne(createActivityDto.gymId);
        if (!gym) {
            throw new common_1.NotFoundException('岩馆不存在');
        }
        const startDate = new Date(createActivityDto.startDatetime);
        const endDate = new Date(createActivityDto.endDatetime);
        if (startDate >= endDate) {
            throw new common_1.BadRequestException('结束时间必须晚于开始时间');
        }
        if (startDate <= new Date()) {
            throw new common_1.BadRequestException('活动开始时间必须在未来');
        }
        const activity = this.activityRepository.create({
            ...createActivityDto,
            organizerId,
            currentParticipants: 1,
        });
        const savedActivity = await this.activityRepository.save(activity);
        return this.findOne(savedActivity.id);
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, includePrivate: _includePrivate = false, ...filters } = queryDto;
        const queryBuilder = this.activityRepository.createQueryBuilder('activity')
            .leftJoinAndSelect('activity.organizer', 'organizer')
            .leftJoinAndSelect('activity.gym', 'gym')
            .orderBy('activity.startDatetime', 'ASC');
        if (!filters.status) {
            queryBuilder.andWhere('activity.status NOT IN (:...excludedStatuses)', {
                excludedStatuses: [activity_entity_1.ActivityStatus.CANCELLED, activity_entity_1.ActivityStatus.COMPLETED]
            });
        }
        if (search && search.trim()) {
            queryBuilder.andWhere('((activity.privacy = :publicPrivacy) OR (activity.privacy = :privatePrivacy AND activity.title ILIKE :searchTerm))', {
                publicPrivacy: activity_entity_1.ActivityPrivacy.PUBLIC,
                privatePrivacy: activity_entity_1.ActivityPrivacy.PRIVATE,
                searchTerm: `%${search.trim()}%`
            });
        }
        else {
            queryBuilder.andWhere('activity.privacy = :privacy', { privacy: activity_entity_1.ActivityPrivacy.PUBLIC });
        }
        if (filters.status) {
            queryBuilder.andWhere('activity.status = :status', { status: filters.status });
        }
        if (filters.climbingType) {
            queryBuilder.andWhere('activity.climbingType = :climbingType', { climbingType: filters.climbingType });
        }
        if (filters.gymId) {
            queryBuilder.andWhere('activity.gymId = :gymId', { gymId: filters.gymId });
        }
        if (filters.city) {
            queryBuilder.andWhere('gym.city = :city', { city: filters.city });
        }
        if (filters.organizerId) {
            queryBuilder.andWhere('activity.organizerId = :organizerId', { organizerId: filters.organizerId });
        }
        if (filters.startDateFrom) {
            queryBuilder.andWhere('activity.startDatetime >= :startDateFrom', { startDateFrom: filters.startDateFrom });
        }
        if (filters.startDateTo) {
            queryBuilder.andWhere('activity.startDatetime <= :startDateTo', { startDateTo: filters.startDateTo });
        }
        const total = await queryBuilder.getCount();
        const data = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        const enrichedData = data.map(activity => this.enrichActivity(activity));
        return {
            data: enrichedData,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const activity = await this.activityRepository.findOne({
            where: { id },
            relations: ['organizer', 'gym', 'reviews'],
        });
        if (!activity) {
            throw new common_1.NotFoundException('活动不存在');
        }
        return this.enrichActivity(activity);
    }
    async update(id, updateActivityDto, userId) {
        const activity = await this.findOne(id);
        if (activity.organizerId !== userId) {
            throw new common_1.ForbiddenException('只有活动组织者可以修改活动');
        }
        if (updateActivityDto.startDatetime && updateActivityDto.endDatetime) {
            if (updateActivityDto.startDatetime >= updateActivityDto.endDatetime) {
                throw new common_1.BadRequestException('结束时间必须晚于开始时间');
            }
        }
        if (updateActivityDto.gymId && updateActivityDto.gymId !== activity.gymId) {
            const gym = await this.climbingGymService.findOne(updateActivityDto.gymId);
            if (!gym) {
                throw new common_1.NotFoundException('岩馆不存在');
            }
        }
        if (activity.status === activity_entity_1.ActivityStatus.COMPLETED || activity.status === activity_entity_1.ActivityStatus.CANCELLED) {
            throw new common_1.BadRequestException('已完成或已取消的活动不能修改');
        }
        await this.activityRepository.update(id, updateActivityDto);
        return this.findOne(id);
    }
    async remove(id, userId) {
        const activity = await this.findOne(id);
        if (activity.organizerId !== userId) {
            throw new common_1.ForbiddenException('只有活动组织者可以删除活动');
        }
        await this.activityRepository.update(id, {
            status: activity_entity_1.ActivityStatus.CANCELLED,
        });
    }
    async joinActivity(id, userId) {
        const activity = await this.findOne(id);
        if (activity.organizerId === userId) {
            throw new common_1.BadRequestException('组织者已自动参与活动');
        }
        if (activity.currentParticipants >= activity.maxParticipants) {
            throw new common_1.BadRequestException('活动已满员');
        }
        if (activity.status !== activity_entity_1.ActivityStatus.PENDING) {
            throw new common_1.BadRequestException('活动状态不允许报名');
        }
        if (activity.startDatetime <= new Date()) {
            throw new common_1.BadRequestException('活动已开始，不能报名');
        }
        await this.activityRepository.update(id, {
            currentParticipants: activity.currentParticipants + 1,
            status: activity.currentParticipants + 1 >= activity.maxParticipants
                ? activity_entity_1.ActivityStatus.CONFIRMED
                : activity_entity_1.ActivityStatus.PENDING,
        });
        return this.findOne(id);
    }
    async leaveActivity(id, userId) {
        const activity = await this.findOne(id);
        if (activity.organizerId === userId) {
            throw new common_1.BadRequestException('组织者不能退出自己的活动');
        }
        if (activity.currentParticipants <= 1) {
            throw new common_1.BadRequestException('当前无其他参与者');
        }
        await this.activityRepository.update(id, {
            currentParticipants: activity.currentParticipants - 1,
            status: activity_entity_1.ActivityStatus.PENDING,
        });
        return this.findOne(id);
    }
    async getMyActivities(userId, queryDto) {
        const modifiedQuery = {
            ...queryDto,
            organizerId: userId,
            includePrivate: true,
        };
        return this.findAll(modifiedQuery);
    }
    async markAsCompleted(id, userId) {
        const activity = await this.findOne(id);
        if (activity.organizerId !== userId) {
            throw new common_1.ForbiddenException('只有活动组织者可以标记活动完成');
        }
        if (activity.status === activity_entity_1.ActivityStatus.CANCELLED) {
            throw new common_1.BadRequestException('已取消的活动不能标记为完成');
        }
        if (activity.status === activity_entity_1.ActivityStatus.COMPLETED) {
            throw new common_1.BadRequestException('活动已经标记为完成');
        }
        await this.activityRepository.update(id, {
            status: activity_entity_1.ActivityStatus.COMPLETED,
        });
        try {
            const participantIds = await this.getActivityParticipants(id);
            if (participantIds.length >= 2) {
                await this.reviewService.generateReviewChain(id, participantIds);
            }
        }
        catch (error) {
            console.error('Failed to generate review chains:', error);
        }
        return this.findOne(id);
    }
    async getActivityParticipants(activityId) {
        const activity = await this.findOne(activityId);
        return [activity.organizerId];
    }
    enrichActivity(activity) {
        const startTime = new Date(activity.startDatetime);
        const endTime = new Date(activity.endDatetime);
        activity.timeRange = `${startTime.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })}-${endTime.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        if (activity.gym) {
            activity.locationText = activity.gym.name;
            activity.gymAddress = activity.gym.address;
            activity.gymCity = activity.gym.city;
        }
        activity.canJoin =
            activity.status === activity_entity_1.ActivityStatus.PENDING &&
                activity.currentParticipants < activity.maxParticipants &&
                activity.startDatetime > new Date();
        activity.minutesToStart = Math.ceil((activity.startDatetime.getTime() - new Date().getTime()) / (1000 * 60));
        return activity;
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_entity_1.Activity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        climbing_gym_service_1.ClimbingGymService,
        review_service_1.ReviewService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map