import { AuthService, AuthResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto, req: any): Promise<AuthResponse>;
    getProfile(req: any): Omit<User, 'password'>;
    refreshToken(req: any): Promise<{
        access_token: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
