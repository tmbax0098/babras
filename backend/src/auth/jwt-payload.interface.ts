import { Types } from 'mongoose';

export interface JwtPayload {
  userId: string | Types.ObjectId;
  phone: string;

}
