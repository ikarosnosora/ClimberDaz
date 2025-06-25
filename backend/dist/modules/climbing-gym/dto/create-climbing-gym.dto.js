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
exports.CreateClimbingGymDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const climbing_gym_entity_1 = require("../entities/climbing-gym.entity");
class CreateClimbingGymDto {
}
exports.CreateClimbingGymDto = CreateClimbingGymDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆名称', example: '北京攀岩馆' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateClimbingGymDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '地址', example: '北京市朝阳区三里屯路123号' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], CreateClimbingGymDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '城市', example: '北京' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateClimbingGymDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '纬度', example: 39.9075 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateClimbingGymDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '经度', example: 116.39723 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateClimbingGymDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '联系电话', example: '010-12345678', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    __metadata("design:type", String)
], CreateClimbingGymDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '营业时间',
        example: {
            monday: '09:00-22:00',
            tuesday: '09:00-22:00',
            wednesday: '09:00-22:00',
            thursday: '09:00-22:00',
            friday: '09:00-22:00',
            saturday: '08:00-23:00',
            sunday: '08:00-23:00'
        },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateClimbingGymDto.prototype, "businessHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '设施信息',
        enum: climbing_gym_entity_1.ClimbingFacility,
        isArray: true,
        example: [climbing_gym_entity_1.ClimbingFacility.BOULDERING, climbing_gym_entity_1.ClimbingFacility.TOP_ROPE, climbing_gym_entity_1.ClimbingFacility.PARKING],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(climbing_gym_entity_1.ClimbingFacility, { each: true }),
    __metadata("design:type", Array)
], CreateClimbingGymDto.prototype, "facilities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆描述', example: '专业攀岩馆，设备齐全', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClimbingGymDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '官网链接', example: 'https://example.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 200),
    __metadata("design:type", String)
], CreateClimbingGymDto.prototype, "website", void 0);
//# sourceMappingURL=create-climbing-gym.dto.js.map