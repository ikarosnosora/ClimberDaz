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
exports.User = exports.Gender = exports.ClimbingLevel = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const bcrypt = require("bcryptjs");
const activity_entity_1 = require("../../activity/entities/activity.entity");
const review_entity_1 = require("../../review/entities/review.entity");
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var ClimbingLevel;
(function (ClimbingLevel) {
    ClimbingLevel["BEGINNER"] = "beginner";
    ClimbingLevel["INTERMEDIATE"] = "intermediate";
    ClimbingLevel["ADVANCED"] = "advanced";
    ClimbingLevel["EXPERT"] = "expert";
})(ClimbingLevel || (exports.ClimbingLevel = ClimbingLevel = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
let User = class User {
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 12);
        }
    }
    async validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }
};
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号' }),
    (0, typeorm_1.Column)({ length: 11, unique: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiHideProperty)(),
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '昵称' }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '头像URL', required: false }),
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '性别', enum: Gender, required: false }),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: Gender, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '出生年份', required: false }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "birthYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '攀岩水平', enum: ClimbingLevel }),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ClimbingLevel, default: ClimbingLevel.BEGINNER }),
    __metadata("design:type", String)
], User.prototype, "climbingLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所在城市', required: false }),
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '个人简介', required: false }),
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '邮箱', required: false }),
    (0, typeorm_1.Column)({ length: 100, nullable: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户角色', enum: UserRole }),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: UserRole, default: UserRole.USER }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否启用' }),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '最后登录时间', required: false }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新时间' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => activity_entity_1.Activity, (activity) => activity.organizer),
    __metadata("design:type", Array)
], User.prototype, "organizedActivities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.reviewer),
    __metadata("design:type", Array)
], User.prototype, "givenReviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.reviewee),
    __metadata("design:type", Array)
], User.prototype, "receivedReviews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组织活动数量' }),
    __metadata("design:type", Number)
], User.prototype, "organizedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '参与活动数量' }),
    __metadata("design:type", Number)
], User.prototype, "participatedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '平均评分' }),
    __metadata("design:type", Number)
], User.prototype, "averageRating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '总评价数' }),
    __metadata("design:type", Number)
], User.prototype, "totalReviews", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "hashPassword", null);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Index)(['phone'], { unique: true }),
    (0, typeorm_1.Index)(['email'], { unique: true, where: 'email IS NOT NULL' })
], User);
//# sourceMappingURL=user.entity.js.map