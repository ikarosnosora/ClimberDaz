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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClimbingGymService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const climbing_gym_entity_1 = require("./entities/climbing-gym.entity");
let ClimbingGymService = class ClimbingGymService {
    constructor(climbingGymRepository, cacheManager) {
        this.climbingGymRepository = climbingGymRepository;
        this.cacheManager = cacheManager;
    }
    async create(createClimbingGymDto) {
        const gym = this.climbingGymRepository.create(createClimbingGymDto);
        return await this.climbingGymRepository.save(gym);
    }
    async findAll(city, isActive = true, limit = 50, offset = 0) {
        const queryBuilder = this.climbingGymRepository
            .createQueryBuilder('gym')
            .where('gym.isActive = :isActive', { isActive });
        if (city) {
            queryBuilder.andWhere('gym.city = :city', { city });
        }
        const [gyms, total] = await queryBuilder
            .orderBy('gym.name', 'ASC')
            .limit(limit)
            .offset(offset)
            .getManyAndCount();
        return { gyms, total };
    }
    async findOne(id) {
        const gym = await this.climbingGymRepository.findOne({
            where: { id },
            relations: ['activities'],
        });
        if (!gym) {
            throw new common_1.NotFoundException(`岩馆 ID ${id} 不存在`);
        }
        return gym;
    }
    async update(id, updateClimbingGymDto) {
        const gym = await this.findOne(id);
        Object.assign(gym, updateClimbingGymDto);
        return await this.climbingGymRepository.save(gym);
    }
    async remove(id) {
        const gym = await this.findOne(id);
        gym.isActive = false;
        await this.climbingGymRepository.save(gym);
    }
    async findByCity(city) {
        const result = await this.findAll(city, true, 100, 0);
        return result.gyms;
    }
    async findNearby(lat, lng, radiusKm = 10) {
        const latRange = radiusKm / 111;
        const lngRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
        return this.climbingGymRepository.find({
            where: {
                lat: (0, typeorm_2.Between)(lat - latRange, lat + latRange),
                lng: (0, typeorm_2.Between)(lng - lngRange, lng + lngRange),
                isActive: true,
            },
            order: { name: 'ASC' },
        });
    }
    async search(keyword) {
        return this.climbingGymRepository.find({
            where: [
                { name: (0, typeorm_2.Like)(`%${keyword}%`), isActive: true },
                { address: (0, typeorm_2.Like)(`%${keyword}%`), isActive: true },
            ],
            order: { name: 'ASC' },
            take: 20,
        });
    }
    async getActiveCities() {
        const cities = await this.climbingGymRepository
            .createQueryBuilder('gym')
            .select('DISTINCT gym.city', 'city')
            .where('gym.isActive = :isActive', { isActive: true })
            .orderBy('gym.city', 'ASC')
            .getRawMany();
        return cities.map(item => item.city);
    }
};
exports.ClimbingGymService = ClimbingGymService;
exports.ClimbingGymService = ClimbingGymService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(climbing_gym_entity_1.ClimbingGym)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], ClimbingGymService);
//# sourceMappingURL=climbing-gym.service.js.map