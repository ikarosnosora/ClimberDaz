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
exports.Activity = exports.ClimbingType = exports.ActivityPrivacy = exports.ActivityStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../user/entities/user.entity");
const climbing_gym_entity_1 = require("../../climbing-gym/entities/climbing-gym.entity");
const review_entity_1 = require("../../review/entities/review.entity");
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["PENDING"] = "pending";
    ActivityStatus["CONFIRMED"] = "confirmed";
    ActivityStatus["CANCELLED"] = "cancelled";
    ActivityStatus["COMPLETED"] = "completed";
})(ActivityStatus || (exports.ActivityStatus = ActivityStatus = {}));
var ActivityPrivacy;
(function (ActivityPrivacy) {
    ActivityPrivacy["PUBLIC"] = "public";
    ActivityPrivacy["PRIVATE"] = "private";
})(ActivityPrivacy || (exports.ActivityPrivacy = ActivityPrivacy = {}));
var ClimbingType;
(function (ClimbingType) {
    ClimbingType["BOULDERING"] = "bouldering";
    ClimbingType["TOP_ROPE"] = "top_rope";
    ClimbingType["LEAD_CLIMBING"] = "lead_climbing";
    ClimbingType["MIXED"] = "mixed";
})(ClimbingType || (exports.ClimbingType = ClimbingType = {}));
let Activity = class Activity {
};
exports.Activity = Activity;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Activity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动标题' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Activity.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动描述', required: false }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始时间' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Activity.prototype, "startDatetime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束时间' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Activity.prototype, "endDatetime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '攀岩类型', enum: ClimbingType }),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ClimbingType }),
    __metadata("design:type", String)
], Activity.prototype, "climbingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '最大参与人数' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Activity.prototype, "maxParticipants", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前参与人数' }),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Activity.prototype, "currentParticipants", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动状态', enum: ActivityStatus }),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ActivityStatus, default: ActivityStatus.PENDING }),
    __metadata("design:type", String)
], Activity.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '隐私设置', enum: ActivityPrivacy }),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ActivityPrivacy, default: ActivityPrivacy.PUBLIC }),
    __metadata("design:type", String)
], Activity.prototype, "privacy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '费用说明', required: false }),
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "costInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '注意事项', required: false }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '组织者ID' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Activity.prototype, "organizerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆ID' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Activity.prototype, "gymId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Activity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新时间' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Activity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.organizedActivities),
    (0, typeorm_1.JoinColumn)({ name: 'organizerId' }),
    __metadata("design:type", user_entity_1.User)
], Activity.prototype, "organizer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => climbing_gym_entity_1.ClimbingGym, (gym) => gym.activities),
    (0, typeorm_1.JoinColumn)({ name: 'gymId' }),
    __metadata("design:type", climbing_gym_entity_1.ClimbingGym)
], Activity.prototype, "gym", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.activity),
    __metadata("design:type", Array)
], Activity.prototype, "reviews", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆名称' }),
    __metadata("design:type", String)
], Activity.prototype, "locationText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆地址' }),
    __metadata("design:type", String)
], Activity.prototype, "gymAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '岩馆城市' }),
    __metadata("design:type", String)
], Activity.prototype, "gymCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '时间范围显示' }),
    __metadata("design:type", String)
], Activity.prototype, "timeRange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否可以参加' }),
    __metadata("design:type", Boolean)
], Activity.prototype, "canJoin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '距离活动开始时间（分钟）' }),
    __metadata("design:type", Number)
], Activity.prototype, "minutesToStart", void 0);
exports.Activity = Activity = __decorate([
    (0, typeorm_1.Entity)('activities'),
    (0, typeorm_1.Index)(['status', 'privacy']),
    (0, typeorm_1.Index)(['startDatetime', 'endDatetime']),
    (0, typeorm_1.Index)(['organizerId']),
    (0, typeorm_1.Index)(['gymId'])
], Activity);
//# sourceMappingURL=activity.entity.js.map