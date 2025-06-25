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
exports.QueryUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../entities/user.entity");
class QueryUserDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.QueryUserDto = QueryUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码', default: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryUserDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页数量', default: 10, minimum: 1, maximum: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], QueryUserDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '攀岩水平', enum: user_entity_1.ClimbingLevel, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_entity_1.ClimbingLevel),
    __metadata("design:type", String)
], QueryUserDto.prototype, "climbingLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '性别', enum: user_entity_1.Gender, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_entity_1.Gender),
    __metadata("design:type", String)
], QueryUserDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '城市', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUserDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索关键词（昵称）', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryUserDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户角色', enum: user_entity_1.UserRole, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_entity_1.UserRole),
    __metadata("design:type", String)
], QueryUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryUserDto.prototype, "isActive", void 0);
//# sourceMappingURL=query-user.dto.js.map