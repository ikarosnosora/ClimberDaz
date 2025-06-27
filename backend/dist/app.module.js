"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const activity_module_1 = require("./modules/activity/activity.module");
const climbing_gym_module_1 = require("./modules/climbing-gym/climbing-gym.module");
const review_module_1 = require("./modules/review/review.module");
const notification_module_1 = require("./modules/notification/notification.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const admin_module_1 = require("./modules/admin/admin.module");
const demo_controller_1 = require("./demo.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'better-sqlite3',
                database: 'climberdaz.db',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
                logging: true,
                dropSchema: false,
            }),
            cache_manager_1.CacheModule.register({
                ttl: 3600,
                max: 1000,
            }),
            auth_module_1.AuthModule,
            climbing_gym_module_1.ClimbingGymModule,
            user_module_1.UserModule,
            activity_module_1.ActivityModule,
            review_module_1.ReviewModule,
            notification_module_1.NotificationModule,
            analytics_module_1.AnalyticsModule,
            admin_module_1.AdminModule,
        ],
        controllers: [demo_controller_1.DemoController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map