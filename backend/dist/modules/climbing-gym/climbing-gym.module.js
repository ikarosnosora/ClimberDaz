"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClimbingGymModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const climbing_gym_entity_1 = require("./entities/climbing-gym.entity");
const climbing_gym_controller_1 = require("./climbing-gym.controller");
const climbing_gym_service_1 = require("./climbing-gym.service");
let ClimbingGymModule = class ClimbingGymModule {
};
exports.ClimbingGymModule = ClimbingGymModule;
exports.ClimbingGymModule = ClimbingGymModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([climbing_gym_entity_1.ClimbingGym]),
            cache_manager_1.CacheModule.register(),
        ],
        controllers: [climbing_gym_controller_1.ClimbingGymController],
        providers: [climbing_gym_service_1.ClimbingGymService],
        exports: [climbing_gym_service_1.ClimbingGymService],
    })
], ClimbingGymModule);
//# sourceMappingURL=climbing-gym.module.js.map