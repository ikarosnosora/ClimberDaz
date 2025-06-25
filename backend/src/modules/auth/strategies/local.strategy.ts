import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'phone', // Use phone instead of username
      passwordField: 'password',
    });
  }

  async validate(phone: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(phone, password);
    
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    return user;
  }
} 