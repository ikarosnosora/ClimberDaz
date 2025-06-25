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
exports.QueryActivityDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const activity_entity_1 = require("../entities/activity.entity");
class QueryActivityDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.includePrivate = false;
    }
}
exports.QueryActivityDto = QueryActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码', default: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryActivityDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页数量', default: 10, minimum: 1, maximum: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], QueryActivityDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动状态', enum: activity_entity_1.ActivityStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(activity_entity_1.ActivityStatus),
    __metadata("design:type", String)
], QueryActivityDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '攀岩类型', enum: activity_entity_1.ClimbingType, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(activity_entity_1.ClimbingType),
    __metadata("design:type", String)
], QueryActivityDto.prototype, "climbingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryActivityDto.prototype, "gymId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '城市', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryActivityDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索关键词（标题）', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryActivityDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始时间筛选（从）', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : undefined),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], QueryActivityDto.prototype, "startDateFrom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始时间筛选（到）', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? new Date(value) : undefined),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], QueryActivityDto.prototype, "startDateTo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组织者ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryActivityDto.prototype, "organizerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否包含私密活动（需要搜索关键词）', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryActivityDto.prototype, "includePrivate", void 0);
//# sourceMappingURL=query-activity.dto.js.map