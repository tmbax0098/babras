import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, type: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    size: { type: String, required: false },
    color: { type: String, required: false }
  }]})
  items!: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }[];

  @Prop({ required: true })
  totalPrice!: number;

  @Prop({ required: true, enum: ['Pending', 'Processing', 'Completed'], default: 'Pending' })
  status!: 'Pending' | 'Processing' | 'Completed';

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);