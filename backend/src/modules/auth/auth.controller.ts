import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '../user/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '注册成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '手机号或邮箱已存在' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '登录成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: '手机号或密码错误' })
  async login(@Body() loginDto: LoginDto, @Request() req): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: User,
  })
  @ApiBearerAuth()
  getProfile(@Request() req): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = req.user;
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiBearerAuth()
  async refreshToken(@Request() req): Promise<{ access_token: string }> {
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: HttpStatus.OK, description: '登出成功' })
  @ApiBearerAuth()
  async logout(): Promise<{ message: string }> {
    // In a stateless JWT system, logout is handled client-side
    // But we can add token blacklisting if needed in the future
    return { message: '登出成功' };
  }
} 