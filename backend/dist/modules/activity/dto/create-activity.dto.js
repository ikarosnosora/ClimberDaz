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
exports.CreateActivityDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const activity_entity_1 = require("../entities/activity.entity");
class CreateActivityDto {
    constructor() {
        this.privacy = activity_entity_1.ActivityPrivacy.PUBLIC;
    }
}
exports.CreateActivityDto = CreateActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动标题', example: '周末抱石约起来！' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动描述', required: false, example: '寻找攀岩搭子，一起提升技术！' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 1000),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始时间', example: '2025-07-15T14:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "startDatetime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束时间', example: '2025-07-15T16:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "endDatetime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '攀岩类型', enum: activity_entity_1.ClimbingType, example: activity_entity_1.ClimbingType.BOULDERING }),
    (0, class_validator_1.IsEnum)(activity_entity_1.ClimbingType),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "climbingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '最大参与人数', example: 4, minimum: 1, maximum: 20 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], CreateActivityDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '隐私设置', enum: activity_entity_1.ActivityPrivacy, default: activity_entity_1.ActivityPrivacy.PUBLIC }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(activity_entity_1.ActivityPrivacy),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "privacy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '费用说明', required: false, example: 'AA制，预计每人50元' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 200),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "costInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '注意事项', required: false, example: '请带好攀岩鞋和粉袋' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 1000),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆ID', example: 'uuid-string' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "gymId", void 0);
//# sourceMappingURL=create-activity.dto.js.map