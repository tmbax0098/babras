import { Controller, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SmsService } from './sms.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // اضافه کردن Logger

  constructor(
    private readonly authService: AuthService,
    private readonly smsService: SmsService,
    private readonly usersService: UsersService, // استفاده از UsersService
  ) {}

  // تابع برای مدیریت کاربرانی که از قبل وجود دارند
  async handleExistingUser(phone: string) {
    this.logger.log(`Handling existing user: ${phone}`);
    // تولید کد تایید (OTP)
    const otp = await this.authService.generateVerificationCode(phone);

    // به‌روزرسانی OTP و زمان انقضا برای کاربر موجود
    const otpExpiryTime = Date.now() + 10 * 60 * 1000; // انقضای 10 دقیقه
    await this.usersService.updateUserOtp(phone, otp, otpExpiryTime);

    // ارسال کد تایید به کاربر
    await this.smsService.sendVerificationCode(phone, otp);
    this.logger.log(`Verification code sent to existing user: ${phone}`);
    return { message: 'Verification code sent to existing user' };
  }


// تابع برای مدیریت کاربرانی که از قبل وجود ندارند (کاربر جدید)
async handleNewUser(phone: string, email?: string, address?: string, fullname?: string) {
  this.logger.log(`Handling new user: ${phone}`);

  // تولید کد تایید (OTP)
  const otp = await this.authService.generateVerificationCode(phone);

  // ایجاد کاربر موقت با OTP و زمان انقضا و فیلدهای اضافی
  const otpExpiryTime = Date.now() + 10 * 60 * 1000; // انقضای 10 دقیقه
  try {
    await this.usersService.createTemporaryUser(phone, otp, otpExpiryTime, email, address, fullname);
    this.logger.log(`Temporary user created successfully for phone: ${phone}`);
  } catch (error) {
    if (error instanceof Error) {
      this.logger.error(`Error creating temporary user for phone ${phone}: ${error.message}`);
    } else {
      this.logger.error(`Error creating temporary user for phone ${phone}: ${error}`);
    }
    throw error;
  }

  // ارسال کد تایید به کاربر
  await this.smsService.sendVerificationCode(phone, otp);
  this.logger.log(`Verification code sent to new user: ${phone}`);
  return { message: 'Verification code sent to new user' };
}


  // ارسال کد تایید به شماره تلفن
  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async verifyPhone(
    @Body() { phone, email, address, fullname }: { phone: string; email?: string; address?: string; fullname?: string }) {
    
    this.logger.log(`Verifying phone number: ${phone}`);
  
    const user = await this.usersService.findByPhone(phone);
  
    // اگر کاربر وجود داشت
    if (user) {
      this.logger.log(`User found: ${phone}`);
      return this.handleExistingUser(phone);
    }
  
    // اگر کاربر وجود نداشت
    this.logger.log(`User not found, creating new user: ${phone}`);
    return this.handleNewUser(phone, email, address, fullname);
  }
  

// تایید کد ارسال شده و ورود کاربر
@Post('confirm-code')
@HttpCode(HttpStatus.OK)
async confirmCode(@Body() { phone, code }: { phone: string; code: string }) {
  this.logger.log(`Confirming code for phone: ${phone}`);
  
  // بررسی کد تایید
  const isValid = await this.authService.verifyCode(phone, code);
  if (!isValid) {
    this.logger.warn(`Invalid verification code for phone: ${phone}`);
    return { message: 'Invalid verification code', success: false };
  }

  // پیدا کردن کاربر
  let user = await this.usersService.findByPhone(phone);

  if (!user) {
    this.logger.warn(`User not found for phone: ${phone}`);
    return { message: 'User not found', success: false };
  }

  // به‌روزرسانی وضعیت تایید کاربر
  user.isVerified = true;
  await this.usersService.updateUserVerificationStatus(phone, true);

  // تولید توکن JWT
  const token = await this.authService.generateJwtToken(user);

  // بازگرداندن تمام اطلاعات کاربر
  return {
    message: 'Login successful',
    accessToken: token,
    user: {
      phone: user.phone,
      email: user.email,
      address: user.address,
      fullname: user.fullname,
      role: user.role 
    },
  };
}

  // ارسال کد لاگین به شماره تلفن
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async sendLoginCode(@Body() { phone }: { phone: string }) {
    this.logger.log(`Sending login code to phone: ${phone}`);

    // بررسی وجود کاربر
    const user = await this.usersService.findByPhone(phone);

    // اگر کاربر وجود داشت
    if (user) {
      return this.handleExistingUser(phone);
    }

    // اگر کاربر وجود نداشت
    return this.handleNewUser(phone);
  }


// تایید کد لاگین و ورود کاربر
@Post('login-confirm')
@HttpCode(HttpStatus.OK)
async loginConfirm(@Body() { phone, code }: { phone: string; code: string }) {
  this.logger.log(`Login confirmation for phone: ${phone}`);
  
  // تایید کد
  const isValid = await this.authService.verifyCode(phone, code);
  if (!isValid) {
    this.logger.warn(`Invalid login code for phone: ${phone}`);
    return { message: 'Invalid verification code', success: false };
  }

  // پیدا کردن کاربر
  let user = await this.usersService.findByPhone(phone);

  if (!user) {
    this.logger.log(`Registering new user for phone: ${phone}`);
    user = await this.authService.register({ phone });
  }

  // به‌روزرسانی وضعیت تایید کاربر
  user = await this.usersService.updateUserVerificationStatus(phone, true);

  // تولید توکن JWT
  const token = await this.authService.generateJwtToken(user);

  // ارسال تمام اطلاعات کاربر
  return {
    message: 'Login successful',
    accessToken: token,
    user: {
      phone: user.phone,
      email: user.email,
      address: user.address,
      fullname: user.fullname,
      role: user.role 
    },
  };
}


}
