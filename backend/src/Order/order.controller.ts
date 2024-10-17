import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
