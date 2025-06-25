import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'password' | 'hashPassword' | 'validatePassword'>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { phone, isActive: true },
    });

    if (user && await user.validatePassword(password)) {
      return user;
    }

    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.phone, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const payload: JwtPayload = {
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

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { phone: registerDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('该手机号已注册');
    }

    // Check email if provided
    if (registerDto.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('该邮箱已注册');
      }
    }

    // Create new user
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

    const payload: JwtPayload = {
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

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async refreshToken(user: User): Promise<{ access_token: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    user.password = newPassword;
    await this.userRepository.save(user);
  }
} 