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
exports.ReviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const review_service_1 = require("./review.service");
const dto_1 = require("./dto");
const review_entity_1 = require("./entities/review.entity");
const review_chain_entity_1 = require("./entities/review-chain.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
let ReviewController = class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    async submitReview(createReviewDto, req) {
        return this.reviewService.submitReview(createReviewDto, req.user.userId);
    }
    async generateReviewChain(reviewChainDto) {
        return this.reviewService.generateReviewChain(reviewChainDto.activityId, reviewChainDto.participantIds);
    }
    async getPendingReviews(req) {
        return this.reviewService.getPendingReviews(req.user.userId);
    }
    async getMyReviews(req, type = 'received') {
        return this.reviewService.getUserReviews(req.user.userId, type);
    }
    async getMyReviewStats(req) {
        return this.reviewService.getUserReviewStats(req.user.userId);
    }
    async getUserReviews(userId, type = 'received') {
        return this.reviewService.getUserReviews(userId, type);
    }
    async getUserReviewStats(userId) {
        return this.reviewService.getUserReviewStats(userId);
    }
    async getActivityReviews(activityId) {
        return this.reviewService.getActivityReviews(activityId);
    }
    async sendReviewReminders() {
        await this.reviewService.sendReviewReminders();
        return { message: '评价提醒发送完成' };
    }
};
exports.ReviewController = ReviewController;
__decorate([
    (0, common_1.Post)('submit'),
    (0, swagger_1.ApiOperation)({ summary: '提交评价' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '评价提交成功', type: review_entity_1.Review }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误或评价已存在' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '评价链不存在' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateReviewDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "submitReview", null);
__decorate([
    (0, common_1.Post)('generate-chain'),
    (0, swagger_1.ApiOperation)({ summary: '生成评价链（活动结束后自动调用）' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '评价链生成成功', type: review_chain_entity_1.ReviewChain }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '参与人数不足' }),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReviewChainDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "generateReviewChain", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: '获取待评价列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功', type: [review_entity_1.Review] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getPendingReviews", null);
__decorate([
    (0, common_1.Get)('my-reviews'),
    (0, swagger_1.ApiOperation)({ summary: '获取我的评价历史' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功', type: [review_entity_1.Review] }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        description: '评价类型：received(收到的) 或 given(给出的)',
        enum: ['received', 'given']
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getMyReviews", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取我的评价统计' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getMyReviewStats", null);
__decorate([
    (0, common_1.Get)('user/:id/reviews'),
    (0, swagger_1.ApiOperation)({ summary: '获取指定用户的评价历史' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功', type: [review_entity_1.Review] }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        description: '评价类型：received(收到的) 或 given(给出的)',
        enum: ['received', 'given']
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getUserReviews", null);
__decorate([
    (0, common_1.Get)('user/:id/stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取指定用户的评价统计' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getUserReviewStats", null);
__decorate([
    (0, common_1.Get)('activity/:id'),
    (0, swagger_1.ApiOperation)({ summary: '获取活动的评价情况' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '活动ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getActivityReviews", null);
__decorate([
    (0, common_1.Post)('send-reminders'),
    (0, swagger_1.ApiOperation)({ summary: '发送评价提醒（定时任务）' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '提醒发送成功' }),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "sendReviewReminders", null);
exports.ReviewController = ReviewController = __decorate([
    (0, swagger_1.ApiTags)('评价管理'),
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [review_service_1.ReviewService])
], ReviewController);
//# sourceMappingURL=review.controller.js.map