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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entities/user.entity");
let AuthService = class AuthService {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async validateUser(phone, password) {
        const user = await this.userRepository.findOne({
            where: { phone, isActive: true },
        });
        if (user && await user.validatePassword(password)) {
            return user;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.phone, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        const payload = {
            sub: user.id,
            phone: user.phone,
            role: user.role,
        };
        const { password, ...userWithoutPassword } = user;
        return {
            access_token: this.jwtService.sign(payload),
            user: userWithoutPassword,
        };
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findOne({
            where: { phone: registerDto.phone },
        });
        if (existingUser) {
            throw new common_1.ConflictException('该手机号已注册');
        }
        if (registerDto.email) {
            const existingEmail = await this.userRepository.findOne({
                where: { email: registerDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('该邮箱已注册');
            }
        }
        const user = this.userRepository.create({
            phone: registerDto.phone,
            password: registerDto.password,
            nickname: registerDto.nickname,
            email: registerDto.email,
            gender: registerDto.gender,
            birthYear: registerDto.birthYear,
            climbingLevel: registerDto.climbingLevel,
            city: registerDto.city,
            bio: registerDto.bio,
        });
        const savedUser = await this.userRepository.save(user);
        const payload = {
            sub: savedUser.id,
            phone: savedUser.phone,
            role: savedUser.role,
        };
        const { password, ...userWithoutPassword } = savedUser;
        return {
            access_token: this.jwtService.sign(payload),
            user: userWithoutPassword,
        };
    }
    async findUserById(id) {
        return this.userRepository.findOne({
            where: { id, isActive: true },
        });
    }
    async refreshToken(user) {
        const payload = {
            sub: user.id,
            phone: user.phone,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async updatePassword(userId, newPassword) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        user.password = newPassword;
        await this.userRepository.save(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map