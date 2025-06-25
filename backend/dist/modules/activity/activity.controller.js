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
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_service_1 = require("./activity.service");
const dto_1 = require("./dto");
const activity_entity_1 = require("./entities/activity.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ActivityController = class ActivityController {
    constructor(activityService) {
        this.activityService = activityService;
    }
    async create(createActivityDto, req) {
        return this.activityService.create(createActivityDto, req.user.userId);
    }
    async findAll(queryDto) {
        console.log('[ActivityController] GET /activities called with query:', queryDto);
        return this.activityService.findAll(queryDto);
    }
    async getMyActivities(queryDto, req) {
        return this.activityService.getMyActivities(req.user.userId, queryDto);
    }
    async findOne(id) {
        return this.activityService.findOne(id);
    }
    async update(id, updateActivityDto, req) {
        return this.activityService.update(id, updateActivityDto, req.user.userId);
    }
    async remove(id, req) {
        return this.activityService.remove(id, req.user.userId);
    }
    async joinActivity(id, req) {
        return this.activityService.joinActivity(id, req.user.userId);
    }
    async leaveActivity(id, req) {
        return this.activityService.leaveActivity(id, req.user.userId);
    }
    async markAsCompleted(id, req) {
        return this.activityService.markAsCompleted(id, req.user.userId);
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建活动' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '活动创建成功', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: '未授权' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '岩馆不存在' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateActivityDto, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取活动列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量', example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '活动状态' }),
    (0, swagger_1.ApiQuery)({ name: 'climbingType', required: false, description: '攀岩类型' }),
    (0, swagger_1.ApiQuery)({ name: 'gymId', required: false, description: '岩馆ID' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: '城市' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: '搜索关键词' }),
    (0, swagger_1.ApiQuery)({ name: 'startDateFrom', required: false, description: '开始时间筛选（从）' }),
    (0, swagger_1.ApiQuery)({ name: 'startDateTo', required: false, description: '开始时间筛选（到）' }),
    (0, swagger_1.ApiQuery)({ name: 'organizerId', required: false, description: '组织者ID' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryActivityDto]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: '获取我的活动' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryActivityDto, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getMyActivities", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取活动详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '活动不存在' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '活动ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新活动' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '活动不存在' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '活动ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateActivityDto, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除活动' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '活动不存在' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '活动ID' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, swagger_1.ApiOperation)({ summary: '参加活动' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '参加成功', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '不能参加活动（已满员、已开始等）' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '活动不存在' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '活动ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "joinActivity", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, swagger_1.ApiOperation)({ summary: '退出活动' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '退出成功', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '不能退出活动' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '活动不存在' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '活动ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "leaveActivity", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: '标记活动完成' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '标记成功', type: activity_entity_1.Activity }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '活动不存在' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '活动ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "markAsCompleted", null);
exports.ActivityController = ActivityController = __decorate([
    (0, swagger_1.ApiTags)('活动管理'),
    (0, common_1.Controller)('activities'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map