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
exports.ClimbingGymController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const climbing_gym_service_1 = require("./climbing-gym.service");
const create_climbing_gym_dto_1 = require("./dto/create-climbing-gym.dto");
const update_climbing_gym_dto_1 = require("./dto/update-climbing-gym.dto");
const climbing_gym_entity_1 = require("./entities/climbing-gym.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let ClimbingGymController = class ClimbingGymController {
    constructor(climbingGymService) {
        this.climbingGymService = climbingGymService;
    }
    create(createClimbingGymDto) {
        return this.climbingGymService.create(createClimbingGymDto);
    }
    findAll(city, limit = '50', offset = '0') {
        return this.climbingGymService.findAll(city, true, parseInt(limit) || 50, parseInt(offset) || 0);
    }
    getActiveCities() {
        return this.climbingGymService.getActiveCities();
    }
    search(keyword) {
        return this.climbingGymService.search(keyword);
    }
    findNearby(lat, lng, radius = '10') {
        return this.climbingGymService.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius) || 10);
    }
    findOne(id) {
        return this.climbingGymService.findOne(id);
    }
    update(id, updateClimbingGymDto) {
        return this.climbingGymService.update(id, updateClimbingGymDto);
    }
    remove(id) {
        return this.climbingGymService.remove(id);
    }
};
exports.ClimbingGymController = ClimbingGymController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建岩馆 (仅管理员)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: '岩馆创建成功', type: climbing_gym_entity_1.ClimbingGym }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_climbing_gym_dto_1.CreateClimbingGymDto]),
    __metadata("design:returntype", Promise)
], ClimbingGymController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取岩馆列表' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: '城市筛选' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: '偏移量', type: Number }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: '岩馆列表获取成功',
        schema: {
            type: 'object',
            properties: {
                gyms: { type: 'array', items: { $ref: '#/components/schemas/ClimbingGym' } },
                total: { type: 'number' }
            }
        }
    }),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ClimbingGymController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('cities'),
    (0, swagger_1.ApiOperation)({ summary: '获取有岩馆的城市列表' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: '城市列表获取成功',
        type: [String]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClimbingGymController.prototype, "getActiveCities", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: '搜索岩馆' }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: true, description: '搜索关键词' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: '搜索结果', type: [climbing_gym_entity_1.ClimbingGym] }),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClimbingGymController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({ summary: '获取附近岩馆' }),
    (0, swagger_1.ApiQuery)({ name: 'lat', required: true, description: '纬度', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lng', required: true, description: '经度', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'radius', required: false, description: '搜索半径(km)', type: Number }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: '附近岩馆列表', type: [climbing_gym_entity_1.ClimbingGym] }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ClimbingGymController.prototype, "findNearby", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取岩馆详情' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: '岩馆详情获取成功', type: climbing_gym_entity_1.ClimbingGym }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: '岩馆不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClimbingGymController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新岩馆信息 (仅管理员)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: '岩馆更新成功', type: climbing_gym_entity_1.ClimbingGym }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: '岩馆不存在' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_climbing_gym_dto_1.UpdateClimbingGymDto]),
    __metadata("design:returntype", Promise)
], ClimbingGymController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除岩馆 (仅管理员)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: '岩馆删除成功' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: '岩馆不存在' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClimbingGymController.prototype, "remove", null);
exports.ClimbingGymController = ClimbingGymController = __decorate([
    (0, swagger_1.ApiTags)('climbing-gyms'),
    (0, common_1.Controller)('climbing-gyms'),
    __metadata("design:paramtypes", [climbing_gym_service_1.ClimbingGymService])
], ClimbingGymController);
//# sourceMappingURL=climbing-gym.controller.js.map