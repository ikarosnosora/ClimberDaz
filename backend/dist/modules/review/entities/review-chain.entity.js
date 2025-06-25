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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewChain = exports.ChainStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
var ChainStatus;
(function (ChainStatus) {
    ChainStatus["PENDING"] = "pending";
    ChainStatus["ACTIVE"] = "active";
    ChainStatus["COMPLETED"] = "completed";
    ChainStatus["EXPIRED"] = "expired";
})(ChainStatus || (exports.ChainStatus = ChainStatus = {}));
let ReviewChain = class ReviewChain {
};
exports.ReviewChain = ReviewChain;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评价链ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReviewChain.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动ID' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ReviewChain.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评价序列 (用户ID数组)', type: [String] }),
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Array)
], ReviewChain.prototype, "userSequence", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '链状态', enum: ChainStatus }),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ChainStatus, default: ChainStatus.PENDING }),
    __metadata("design:type", String)
], ReviewChain.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '触发时间（活动结束后2小时）' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ReviewChain.prototype, "triggerTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评价窗口结束时间（48小时后）' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ReviewChain.prototype, "expireTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '已完成评价数量' }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ReviewChain.prototype, "completedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '总评价数量' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ReviewChain.prototype, "totalCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ReviewChain.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新时间' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ReviewChain.prototype, "updatedAt", void 0);
exports.ReviewChain = ReviewChain = __decorate([
    (0, typeorm_1.Entity)('review_chains'),
    (0, typeorm_1.Index)(['activityId']),
    (0, typeorm_1.Index)(['status'])
], ReviewChain);
//# sourceMappingURL=review-chain.entity.js.map