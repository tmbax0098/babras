import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';
import { CartProduct } from './cart.schema';
import { v4 as uuidv4 } from 'uuid'; // برای تولید cartId برای کاربران مهمان

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  // ایجاد سبد خرید جدید برای کاربر یا مهمان
  async createCart(userId?: string): Promise<Cart> {
    const newCart = new this.cartModel({
      userId: userId || null, // اگر کاربر لاگین نباشد، userId برابر null است
      cartId: uuidv4(), // استفاده از uuid برای تولید cartId برای کاربران مهمان
      products: [],
      status: 'active',
      totalPrice: 0,
    });
    return newCart.save(); // ذخیره سبد جدید
  }

  // اضافه کردن محصول به سبد خرید
  async addProductToCart(cartId: string, product: CartProduct): Promise<Cart> {
    const cart = await this.cartModel.findOne({ cartId });
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    // بررسی وجود محصول در سبد
    const existingProduct = cart.products.find(
      (p) => p.productId.toString() === product.productId.toString() &&
             p.selectedSize === product.selectedSize &&
             p.selectedColor === product.selectedColor
    );

    if (existingProduct) {
      // اگر محصول وجود دارد، تعداد آن به‌روزرسانی می‌شود
      existingProduct.quantity += product.quantity;
    } else {
      // اگر محصول جدید است، به سبد اضافه می‌شود
      cart.products.push(product);
    }

    // به‌روزرسانی قیمت کل
    cart.totalPrice += product.quantity * product.price;

    return cart.save(); // ذخیره سبد به‌روزشده
  }

  // حذف محصول از سبد خرید
  async removeProductFromCart(cartId: string, productId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ cartId });
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${productId} not found in cart`);
    }

    // به‌روزرسانی قیمت کل پیش از حذف محصول
    cart.totalPrice -= cart.products[productIndex].quantity * cart.products[productIndex].price;

    // حذف محصول از سبد
    cart.products.splice(productIndex, 1);

    return cart.save(); // ذخیره تغییرات
  }

  // به‌روزرسانی تعداد محصول در سبد خرید
  async updateProductQuantity(cartId: string, productId: string, newQuantity: number): Promise<Cart> {
    const cart = await this.cartModel.findOne({ cartId });
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const product = cart.products.find((p) => p.productId.toString() === productId.toString());
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found in cart`);
    }

    // به‌روزرسانی تعداد محصول و قیمت کل
    cart.totalPrice -= product.quantity * product.price; // حذف تاثیر تعداد قدیمی از قیمت کل
    product.quantity = newQuantity;
    cart.totalPrice += product.quantity * product.price; // اضافه کردن تاثیر تعداد جدید به قیمت کل

    return cart.save(); // ذخیره سبد به‌روزشده
  }

  // دریافت اطلاعات سبد خرید با استفاده از cartId یا userId
  async getCart(cartId: string, userId?: string): Promise<Cart> {
    const query = userId ? { userId } : { cartId };
    const cart = await this.cartModel.findOne(query).lean(); // استفاده از lean برای بهینه‌سازی

    if (!cart) {
      throw new NotFoundException(`Cart not found`);
    }
    return cart;
  }

  // دریافت سبد خرید برای کاربر لاگین‌شده
  async getCartByUser(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).lean();
    if (!cart) {
      throw new NotFoundException(`Cart not found for user with ID ${userId}`);
    }
    return cart;
  }

  // خالی کردن سبد خرید پس از ثبت سفارش
  async clearCart(cartId: string): Promise<void> {
    const cart = await this.cartModel.findOne({ cartId });
    if (cart) {
      cart.products = []; // حذف تمام محصولات از سبد
      cart.totalPrice = 0; // بازنشانی قیمت کل
      await cart.save(); // ذخیره تغییرات
    }
  }
}
