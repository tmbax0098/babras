import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './user.schema';
import { AuthModule } from '../auth/auth.module'; // اضافه کردن AuthModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    forwardRef(() => AuthModule), // اضافه کردن AuthModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // خروجی دادن UsersService برای استفاده در سایر ماژول‌ها
})
export class UsersModule {}
