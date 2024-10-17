import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const createdOrder = new this.orderModel(createOrderDto);
    return createdOrder.save();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID “${id}” not found.`);
    }
    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      { status: updateOrderStatusDto.status },
      { new: true },
    ).exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID “${id}” not found.`);
    }
    return updatedOrder;
  }
}