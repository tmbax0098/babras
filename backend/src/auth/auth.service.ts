import { Injectable, UnauthorizedException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private verificationCodes = new Map<string, { code: string; expiresAt: number }>();
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // تولید توکن JWT
  public generateJwtToken(user: any): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      phone: user.phone,
    };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || '1h',
      secret: process.env.JWT_SECRET || 'secretKey',
    });
  }

  // تولید و ذخیره کد تایید
  async generateVerificationCode(phone: string): Promise<string> {
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    await this.saveVerificationCode(phone, verificationCode);
    return verificationCode;
  }

  // ذخیره کد تایید به همراه زمان انقضا
  async saveVerificationCode(phone: string, code: string): Promise<void> {
    const expiresAt = Date.now() + (parseInt(process.env.CODE_EXPIRATION_TIME || '600000'));

    const hashedCode = await bcrypt.hash(code, 10);
    this.verificationCodes.set(phone, { code: hashedCode, expiresAt });
    this.logger.log(`Verification code for ${phone} saved successfully.`);
  }

  // تایید کد وارد شده توسط کاربر
  async verifyCode(phone: string, code: string): Promise<boolean> {
    this.logger.log(`Verifying code for phone: ${phone}`);
    const verificationData = this.verificationCodes.get(phone);
    
    if (!verificationData) {
      this.logger.warn(`Verification code for ${phone} not found`);
      throw new NotFoundException('Verification code not found');
    }

    const { code: hashedCode, expiresAt } = verificationData;

    if (Date.now() > expiresAt) {
      this.verificationCodes.delete(phone);
      this.logger.warn(`Verification code for ${phone} expired`);
      throw new UnauthorizedException('Verification code expired');
    }

    const isValid = await bcrypt.compare(code, hashedCode);
    if (!isValid) {
      this.logger.warn(`Invalid verification code for ${phone}`);
      throw new UnauthorizedException('Invalid verification code');
    }

    this.logger.log(`Verification code for ${phone} validated successfully.`);
    return true;
  }

  // مدیریت کاربران موجود
  async handleExistingUser(phone: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // به‌روزرسانی وضعیت تایید کاربر
    await this.usersService.updateUserVerificationStatus(phone, true);
  
    // تولید توکن JWT
    const token = this.generateJwtToken(user);
  
    // برگرداندن اطلاعات کامل کاربر
    return {
      message: 'Login successful',
      accessToken: token,
      user: {
        phone: user.phone,
        email: user.email,
        address: user.address,
        fullname: user.fullname,
      },
    };
  }
  
  // مدیریت کاربران جدید (ثبت‌نام)
  async handleNewUser(phone: string): Promise<any> {
    // ثبت‌نام کاربر جدید
    let newUser = await this.register({ phone });
  
    // به‌روزرسانی وضعیت تایید کاربر
    newUser = await this.usersService.updateUserVerificationStatus(phone, true);
  
    // تولید توکن JWT
    const token = this.generateJwtToken(newUser);
  
    // برگرداندن اطلاعات کامل کاربر
    return {
      message: 'Registration and login successful',
      accessToken: token,
      user: {
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        fullname: newUser.fullname,
      },
    };
  }
  

  // تایید کد و مدیریت کاربران موجود یا جدید
  async confirmCode(phone: string, code: string): Promise<any> {
    const isValid = await this.verifyCode(phone, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }
  
    // بررسی وجود کاربر
    const user = await this.usersService.findByPhone(phone);
    if (user) {
      // کاربر موجود
      return this.handleExistingUser(phone);
    } else {
      // کاربر جدید
      return this.handleNewUser(phone);
    }
  }
  

  // ثبت‌نام کاربر با استفاده از شماره تلفن
  async register({ phone }: { phone: string }) {
    // چک کردن اینکه شماره از قبل موجود نباشد
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    // ایجاد کاربر جدید
    const newUser = await this.usersService.create({ phone });
    this.logger.log(`User with phone ${phone} created successfully.`);
    return newUser;
  }
}
