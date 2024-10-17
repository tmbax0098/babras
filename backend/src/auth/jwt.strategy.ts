import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service'; // اضافه کردن UsersService
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,  // استفاده از UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'secretKey', // استفاده از کلید JWT از .env
    });
  }

  // متد validate برای اعتبارسنجی JWT
  async validate(payload: JwtPayload) {
    try {
      console.log('Validating JWT Payload:', payload);  // لاگ کردن payload برای دیباگ
      // استفاده از UsersService برای یافتن کاربر با شماره تلفن
      const user = await this.usersService.findByPhone(payload.phone); 
      if (!user) {
        console.error(`User with phone ${payload.phone} not found or token invalid`);
        throw new UnauthorizedException('Invalid token or user not found');
      }
      return user; // برگرداندن کاربر معتبر
    } catch (error) {
      console.error('Error validating JWT:', error);
      throw new UnauthorizedException('Unauthorized access');
    }
  }
}
