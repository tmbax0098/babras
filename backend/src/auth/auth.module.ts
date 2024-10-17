import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service'; // اضافه کردن SmsService

@Module({
  imports: [
    forwardRef(() => UsersModule),  // جلوگیری از وابستگی چرخه‌ای
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'defaultSecretKey',
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SmsService],  // اضافه کردن SmsService به providers
  exports: [AuthService, JwtModule],  // صادر کردن AuthService و JwtModule
})
export class AuthModule {}
