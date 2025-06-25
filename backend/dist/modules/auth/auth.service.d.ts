import { JwtService } from '@nestjs/jwt';
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
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    validateUser(phone: string, password: string): Promise<User | null>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    findUserById(id: string): Promise<User | null>;
    refreshToken(user: User): Promise<{
        access_token: string;
    }>;
    updatePassword(userId: string, newPassword: string): Promise<void>;
}
