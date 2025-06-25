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
exports.Review = exports.ReviewRating = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../user/entities/user.entity");
const activity_entity_1 = require("../../activity/entities/activity.entity");
var ReviewRating;
(function (ReviewRating) {
    ReviewRating["GOOD"] = "good";
    ReviewRating["BAD"] = "bad";
    ReviewRating["NO_SHOW"] = "no_show";
    ReviewRating["SKIP"] = "skip";
})(ReviewRating || (exports.ReviewRating = ReviewRating = {}));
let Review = class Review {
};
exports.Review = Review;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评价ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Review.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评分', enum: ReviewRating }),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ReviewRating }),
    __metadata("design:type", String)
], Review.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评价内容', required: false }),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '活动ID' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评价者ID' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "reviewerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '被评价者ID' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "revieweeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评价链ID' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "chainId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否已提交' }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Review.prototype, "isSubmitted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '提交截止时间' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Review.prototype, "submitDeadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新时间' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Review.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => activity_entity_1.Activity, (activity) => activity.reviews),
    (0, typeorm_1.JoinColumn)({ name: 'activityId' }),
    __metadata("design:type", activity_entity_1.Activity)
], Review.prototype, "activity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.givenReviews),
    (0, typeorm_1.JoinColumn)({ name: 'reviewerId' }),
    __metadata("design:type", user_entity_1.User)
], Review.prototype, "reviewer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedReviews),
    (0, typeorm_1.JoinColumn)({ name: 'revieweeId' }),
    __metadata("design:type", user_entity_1.User)
], Review.prototype, "reviewee", void 0);
exports.Review = Review = __decorate([
    (0, typeorm_1.Entity)('reviews'),
    (0, typeorm_1.Index)(['activityId']),
    (0, typeorm_1.Index)(['reviewerId']),
    (0, typeorm_1.Index)(['revieweeId']),
    (0, typeorm_1.Index)(['chainId'])
], Review);
//# sourceMappingURL=review.entity.js.map