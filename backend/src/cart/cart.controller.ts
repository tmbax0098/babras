import { Controller, Get, Post, Put, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartProduct } from './cart.schema';


@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ایجاد سبد خرید برای یک کاربر (مهمان یا لاگین شده)
  @Post('create/:userId')
  async createCart(@Param('userId') userId: string) {
    const cart = await this.cartService.createCart(userId);
    if (!cart) {
      throw new NotFoundException('Cart could not be created');
    }
    return cart;
  }

  // اضافه کردن محصول به سبد خرید (هم برای کاربران لاگین و هم مهمان)
  @Put('add-product/:cartId')
  async addProductToCart(
    @Param('cartId') cartId: string,
    @Body() product: CartProduct,
  ) {
    const updatedCart = await this.cartService.addProductToCart(cartId, product);
    if (!updatedCart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    return updatedCart;
  }
  

  // حذف محصول از سبد خرید (هم برای کاربران لاگین و هم مهمان)
  @Put('remove-product/:cartId/:productId')
  async removeProductFromCart(
    @Param('cartId') cartId: string,
    @Param('productId') productId: string,
  ) {
    const updatedCart = await this.cartService.removeProductFromCart(cartId, productId);
    if (!updatedCart) {
      throw new NotFoundException(`Product with ID ${productId} not found in cart with ID ${cartId}`);
    }
    return updatedCart;
  }

  // دریافت اطلاعات سبد خرید (مهمان و لاگین شده)
  @Get(':cartId')
  async getCart(@Param('cartId') cartId: string) {
    const cart = await this.cartService.getCart(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    return cart;
  }

  // به‌روزرسانی تعداد محصول در سبد خرید
  @Put('update-quantity/:cartId')
  async updateProductQuantity(
    @Param('cartId') cartId: string,
    @Body() updateData: { productId: string; quantity: number },
  ) {
    const updatedCart = await this.cartService.updateProductQuantity(
      cartId,
      updateData.productId,
      updateData.quantity,
    );
    if (!updatedCart) {
      throw new NotFoundException('Cart or product not found or update failed');
    }
    return updatedCart;
  }
}
