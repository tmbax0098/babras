import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name); // استفاده از Logger برای لاگ‌ها

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

// ایجاد کاربر جدید با فیلدهای اضافی
async create(userData: { phone: string, email?: string, address?: string, fullname?: string, role?: string }): Promise<User> {
  try {
    const existingUser = await this.userModel.findOne({ phone: userData.phone }).exec();
    if (existingUser) {
      throw new ConflictException('Phone number already registered.');
    }

    // ایجاد کاربر جدید با نقش پیش‌فرض 'user' یا نقش وارد شده
    const createdUser = new this.userModel({
      phone: userData.phone,
      email: userData.email,
      address: userData.address,
      fullname: userData.fullname,
      role: userData.role || 'user',  // اگر نقشی تعیین نشده بود، پیش‌فرض 'user'
    });
    return await createdUser.save();
  } catch (error) {
    if (error instanceof Error) {
      this.logger.error(`Failed to create user: ${error.message}`);
    } else {
      this.logger.error('An unknown error occurred while creating user');
    }
    throw new NotFoundException('Failed to create user. Please try again.');
  }
}

 // متد برای تغییر نقش کاربر
 async assignRole(userId: string, newRole: 'user' | 'admin'): Promise<User> {
  const user = await this.userModel.findById(userId).exec();
  if (!user) {
    throw new NotFoundException('User not found');
  }
 // تغییر نقش کاربر
 user.role = newRole;
 try {
   return await user.save();
 } catch (error) {
  if (error instanceof Error) {
    this.logger.error(`Failed to assign role: ${error.message}`);
  } else {
    this.logger.error('An unknown error occurred while assigning role');
  }
  throw new NotFoundException('Failed to assign role.');
 }
}




// به‌روزرسانی اطلاعات کاربر شامل ایمیل، آدرس و نام کامل
async updateUserInfo(phone: string, email?: string, address?: string, fullname?: string): Promise<User> {
  const user = await this.userModel.findOne({ phone }).exec();
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // به‌روزرسانی فیلدهای کاربر
  user.email = email || user.email;
  user.address = address || user.address;
  user.fullname = fullname || user.fullname;

  try {
    return await user.save();
  } catch (error) {
    this.logger.error(`Failed to update user info for phone: ${phone}`);
    throw new NotFoundException('Failed to update user info.');
  }
}






// ایجاد کاربر موقت همراه با OTP و زمان انقضا
// ایجاد کاربر موقت با فیلدهای اضافی
async createTemporaryUser(phone: string, otp: string, otpExpiryTime: number, email?: string, address?: string, fullname?: string): Promise<User> {
  this.logger.log(`Attempting to create a temporary user for phone: ${phone}`);

  // بررسی وجود کاربر با این شماره تلفن
  const existingUser = await this.userModel.findOne({ phone }).exec();
  if (existingUser) {
    this.logger.warn(`User with phone number ${phone} already exists.`);
    throw new ConflictException('Phone number already registered.');
  }

  // هش کردن OTP برای امنیت بیشتر
  const hashedOtp = await bcrypt.hash(otp, 10);

  // ایجاد کاربر موقت با فیلدهای اضافی
  const createdUser = new this.userModel({
    phone,
    otp: hashedOtp,
    otpExpiryTime,
    isVerified: false,
    email: email || null,
    address: address || null,
    fullname: fullname || null,
  });

  try {
    const savedUser = await createdUser.save();
    this.logger.log(`Temporary user created successfully for phone: ${phone}`);
    return savedUser;
  } catch (error) {
    if (error instanceof Error) {
      this.logger.error(`Failed to create temporary user for phone: ${phone}, error: ${error.message}`);
    } else {
      this.logger.error(`Unknown error occurred while creating temporary user for phone: ${phone}`);
    }
    throw new NotFoundException('Failed to create temporary user.');
  }
  
}




  // به‌روزرسانی OTP و زمان انقضا برای کاربر موجود
  async updateUserOtp(phone: string, otp: string, otpExpiryTime: number): Promise<User> {
    const user = await this.userModel.findOne({ phone }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // به‌روزرسانی کد OTP و زمان انقضا
    user.otp = otp;
    user.otpExpiryTime = otpExpiryTime;

    try {
      return await user.save();
    } catch (error) {
      this.logger.error(`Failed to update OTP for phone: ${phone}`);
      throw new NotFoundException('Failed to update OTP.');
    }
  }

  // به‌روزرسانی وضعیت تایید کاربر
  async updateUserVerificationStatus(phone: string, isVerified: boolean): Promise<User> {
    try {
      const user = await this.userModel.findOne({ phone }).exec();
      if (!user) {
        throw new NotFoundException(`User with phone number ${phone} not found.`);
      }
      user.isVerified = isVerified;
      return await user.save();
    } catch (error) {
      this.logger.error(`Failed to update verification status for phone: ${phone}`);
      throw new NotFoundException(`Failed to update verification status.`);
    }
  }

  // یافتن کاربر بر اساس شماره تلفن
  async findByPhone(phone: string): Promise<User | null> {
    this.logger.log(`Searching user by phone: ${phone}`);
  
    const user = await this.userModel.findOne({ phone }).exec();
    if (!user) {
      this.logger.warn(`User with phone number ${phone} not found.`);
      return null;  // بازگشت مقدار null به جای پرتاب خطا
    }
  
    this.logger.log(`User found for phone number ${phone}`);
    return user;
  }
  

  // سایر متدها برای مدیریت کاربران
  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to fetch users: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while fetching users.');
      }
      throw new NotFoundException('Failed to fetch users.');
    }
  }
  

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      return user;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to fetch user with ID ${id}: ${error.message}`);
      } else {
        this.logger.error(`Unknown error occurred while fetching user with ID ${id}.`);
      }
      throw new NotFoundException(`Failed to fetch user with ID ${id}.`);
    }
  }
  
  

  async update(id: string, userData: { phone?: string }): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, userData, { new: true }).exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found for update.`);
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to update user with ID ${id}: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while updating user.');
      }
      throw new NotFoundException(`Failed to update user with ID ${id}.`);
    }
  }
  
  async remove(id: string): Promise<User> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found for deletion.`);
      }
      return deletedUser;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to delete user with ID ${id}: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while deleting user.');
      }
      throw new NotFoundException(`Failed to delete user with ID ${id}.`);
    }
  }
  
}
