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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const dto_1 = require("./dto");
const user_entity_1 = require("./entities/user.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getProfile(req) {
        return this.userService.findById(req.user.userId);
    }
    async updateProfile(updateUserDto, req) {
        return this.userService.update(req.user.userId, updateUserDto);
    }
    async getUserStats(req) {
        return this.userService.getUserStats(req.user.userId);
    }
    async searchUsers(query, limit) {
        return this.userService.searchUsers(query, limit);
    }
    async findAll(queryDto) {
        return this.userService.findAll(queryDto);
    }
    async findOne(id) {
        const user = await this.userService.findById(id);
        if (!user) {
            throw new Error('用户不存在');
        }
        return user;
    }
    async getOtherUserStats(id) {
        return this.userService.getUserStats(id);
    }
    async deactivateUser(id) {
        return this.userService.deactivate(id);
    }
    async activateUser(id) {
        return this.userService.activate(id);
    }
    async changeUserRole(id, role) {
        return this.userService.changeRole(id, role);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前用户信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功', type: user_entity_1.User }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiOperation)({ summary: '更新当前用户信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取当前用户统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: '搜索用户' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '搜索成功' }),
    (0, swagger_1.ApiQuery)({ name: 'q', description: '搜索关键词' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '返回数量限制', example: 10 }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户列表（仅管理员）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取用户详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取指定用户统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getOtherUserStats", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: '停用用户（仅管理员）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '停用成功', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deactivateUser", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: '激活用户（仅管理员）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '激活成功', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "activateUser", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    (0, swagger_1.ApiOperation)({ summary: '修改用户角色（仅管理员）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '修改成功', type: user_entity_1.User }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changeUserRole", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('用户管理'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map