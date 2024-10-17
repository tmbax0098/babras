import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  phone!: string;

  @Prop()
  otp!: string;

  @Prop()
  otpExpiryTime!: number;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  address?: string;

  @Prop({ required: false })
  fullname?: string;

  // اضافه کردن فیلد role برای تعیین نقش کاربر
  @Prop({
    type: String,
    enum: ['user', 'admin'],  // فقط دو مقدار user و admin را قبول می‌کند
    default: 'user',  // به صورت پیش‌فرض نقش کاربر user است
  })
  role!: string;

  _id?: Types.ObjectId; 
}

export const UserSchema = SchemaFactory.createForClass(User);
