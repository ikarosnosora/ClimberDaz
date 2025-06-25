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
exports.Notification = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../user/entities/user.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["ACTIVITY_UPDATE"] = "activity_update";
    NotificationType["ACTIVITY_CANCELLED"] = "activity_cancelled";
    NotificationType["ACTIVITY_COMPLETED"] = "activity_completed";
    NotificationType["NEW_PARTICIPANT"] = "new_participant";
    NotificationType["PARTICIPANT_LEFT"] = "participant_left";
    NotificationType["REVIEW_REMINDER"] = "review_reminder";
    NotificationType["NEW_REVIEW"] = "new_review";
    NotificationType["SYSTEM_ANNOUNCEMENT"] = "system_announcement";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '通知ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户ID' }),
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '通知类型', enum: NotificationType }),
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
    }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '通知标题' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '通知内容' }),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Notification.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否已读', default: false }),
    (0, typeorm_1.Column)({ name: 'is_read', default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '已读时间', nullable: true }),
    (0, typeorm_1.Column)({ name: 'read_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联对象ID', nullable: true }),
    (0, typeorm_1.Column)({ name: 'related_id', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "relatedId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联对象类型', nullable: true }),
    (0, typeorm_1.Column)({ name: 'related_type', nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "relatedType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '额外数据', nullable: true }),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '创建时间' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '更新时间' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Notification.prototype, "user", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications')
], Notification);
//# sourceMappingURL=notification.entity.js.map