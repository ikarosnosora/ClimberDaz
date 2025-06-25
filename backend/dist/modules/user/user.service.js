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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const review_entity_1 = require("../review/entities/review.entity");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findById(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['organizedActivities', 'givenReviews', 'receivedReviews']
        });
        if (user) {
            return this.enrichUserStats(user);
        }
        return null;
    }
    async findByPhone(phone) {
        return this.userRepository.findOne({ where: { phone } });
    }
    async findByEmail(email) {
        if (!email)
            return null;
        return this.userRepository.findOne({ where: { email } });
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, ...filters } = queryDto;
        const queryBuilder = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.organizedActivities', 'activities')
            .leftJoinAndSelect('user.receivedReviews', 'reviews')
            .where('user.isActive = :isActive', { isActive: true });
        if (search && search.trim()) {
            queryBuilder.andWhere('user.nickname ILIKE :search', { search: `%${search.trim()}%` });
        }
        if (filters.climbingLevel) {
            queryBuilder.andWhere('user.climbingLevel = :climbingLevel', { climbingLevel: filters.climbingLevel });
        }
        if (filters.gender) {
            queryBuilder.andWhere('user.gender = :gender', { gender: filters.gender });
        }
        if (filters.city) {
            queryBuilder.andWhere('user.city = :city', { city: filters.city });
        }
        if (filters.role) {
            queryBuilder.andWhere('user.role = :role', { role: filters.role });
        }
        if (filters.isActive !== undefined) {
            queryBuilder.andWhere('user.isActive = :isActiveFilter', { isActiveFilter: filters.isActive });
        }
        queryBuilder.orderBy('user.createdAt', 'DESC');
        const total = await queryBuilder.getCount();
        const users = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        const enrichedUsers = users.map(user => this.enrichUserStats(user));
        return {
            data: enrichedUsers,
            total,
            page,
            limit,
        };
    }
    async create(userData) {
        if (userData.phone) {
            const existingUser = await this.findByPhone(userData.phone);
            if (existingUser) {
                throw new common_1.ConflictException('手机号已存在');
            }
        }
        if (userData.email) {
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new common_1.ConflictException('邮箱已存在');
            }
        }
        const user = this.userRepository.create(userData);
        const savedUser = await this.userRepository.save(user);
        return this.enrichUserStats(savedUser);
    }
    async update(id, updateUserDto) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('邮箱已被其他用户使用');
            }
        }
        await this.userRepository.update(id, updateUserDto);
        const updatedUser = await this.findById(id);
        return updatedUser;
    }
    async updateLastLogin(id) {
        await this.userRepository.update(id, {
            lastLoginAt: new Date()
        });
    }
    async deactivate(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        await this.userRepository.update(id, { isActive: false });
        const updatedUser = await this.findById(id);
        return updatedUser;
    }
    async activate(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        await this.userRepository.update(id, { isActive: true });
        const updatedUser = await this.findById(id);
        return updatedUser;
    }
    async changeRole(id, role) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        await this.userRepository.update(id, { role });
        const updatedUser = await this.findById(id);
        return updatedUser;
    }
    async getUserStats(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['organizedActivities', 'receivedReviews']
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const organizedCount = user.organizedActivities?.length || 0;
        const totalReviews = user.receivedReviews?.length || 0;
        let averageRating = 0;
        if (totalReviews > 0) {
            const positiveReviews = user.receivedReviews.filter(review => review.rating === review_entity_1.ReviewRating.GOOD).length;
            averageRating = (positiveReviews / totalReviews) * 100;
        }
        return {
            organizedCount,
            participatedCount: 0,
            averageRating,
            totalReviews,
            joinDate: user.createdAt,
        };
    }
    async searchUsers(query, limit = 10) {
        if (!query || query.trim().length < 2) {
            return [];
        }
        const users = await this.userRepository.find({
            where: [
                { nickname: (0, typeorm_2.Like)(`%${query.trim()}%`) },
                { phone: (0, typeorm_2.Like)(`%${query.trim()}%`) }
            ],
            take: limit,
            order: { createdAt: 'DESC' }
        });
        return users.map(user => this.enrichUserStats(user));
    }
    enrichUserStats(user) {
        user.organizedCount = user.organizedActivities?.length || 0;
        user.totalReviews = user.receivedReviews?.length || 0;
        if (user.totalReviews > 0) {
            const positiveReviews = user.receivedReviews?.filter(review => review.rating === review_entity_1.ReviewRating.GOOD).length || 0;
            user.averageRating = Math.round((positiveReviews / user.totalReviews) * 100);
        }
        else {
            user.averageRating = 0;
        }
        user.participatedCount = 0;
        return user;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map