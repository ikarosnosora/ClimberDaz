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
exports.ClimbingGym = exports.ClimbingFacility = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const activity_entity_1 = require("../../activity/entities/activity.entity");
var ClimbingFacility;
(function (ClimbingFacility) {
    ClimbingFacility["BOULDERING"] = "bouldering";
    ClimbingFacility["TOP_ROPE"] = "top_rope";
    ClimbingFacility["LEAD_CLIMBING"] = "lead_climbing";
    ClimbingFacility["TRAINING_AREA"] = "training_area";
    ClimbingFacility["EQUIPMENT_RENTAL"] = "equipment_rental";
    ClimbingFacility["SHOWER"] = "shower";
    ClimbingFacility["PARKING"] = "parking";
})(ClimbingFacility || (exports.ClimbingFacility = ClimbingFacility = {}));
let ClimbingGym = class ClimbingGym {
};
exports.ClimbingGym = ClimbingGym;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClimbingGym.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆名称' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], ClimbingGym.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '地址' }),
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], ClimbingGym.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '城市' }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], ClimbingGym.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '纬度' }),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 8 }),
    __metadata("design:type", Number)
], ClimbingGym.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '经度' }),
    (0, typeorm_1.Column)('decimal', { precision: 11, scale: 8 }),
    __metadata("design:type", Number)
], ClimbingGym.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '联系电话', required: false }),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], ClimbingGym.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '营业时间', required: false }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ClimbingGym.prototype, "businessHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '设施信息', enum: ClimbingFacility, isArray: true }),
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], ClimbingGym.prototype, "facilities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆描述', required: false }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ClimbingGym.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '官网链接', required: false }),
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], ClimbingGym.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用' }),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ClimbingGym.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ClimbingGym.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新时间' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ClimbingGym.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => activity_entity_1.Activity, (activity) => activity.gym),
    __metadata("design:type", Array)
], ClimbingGym.prototype, "activities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联活动数量' }),
    __metadata("design:type", Number)
], ClimbingGym.prototype, "activityCount", void 0);
exports.ClimbingGym = ClimbingGym = __decorate([
    (0, typeorm_1.Entity)('climbing_gyms'),
    (0, typeorm_1.Index)(['city', 'isActive']),
    (0, typeorm_1.Index)(['lat', 'lng'])
], ClimbingGym);
//# sourceMappingURL=climbing-gym.entity.js.map