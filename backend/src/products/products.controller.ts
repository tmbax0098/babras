import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() productData: any): Promise<Product> {
    try {
      // بررسی اینکه آیا لیست URL تصاویر وجود دارد
      if (!productData.images || productData.images.length === 0) {
        throw new Error('Images are required for the product');
      }
  
      // ارسال اطلاعات محصول به سرویس برای ایجاد محصول
      return await this.productsService.create(productData);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating product:', error.message);
      } else {
        console.error('Unknown error creating product:', error);
      }
      throw new Error('Failed to create product');
    }
  }
  

  @Get()
  async findAll(): Promise<Product[]> {
    // بازگرداندن لیست محصولات بدون نیاز به مدیریت URL تصاویر
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    // بازگرداندن اطلاعات محصول بدون نیاز به مدیریت URL تصاویر
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() productData: Partial<Product>,
  ): Promise<Product> {
    return this.productsService.update(id, productData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Product> {
    return this.productsService.remove(id);
  }
}
