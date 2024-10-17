import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async create(productData: any): Promise<Product> {
    // اطمینان از اینکه آرایه‌ی URL تصاویر معتبر است
    if (!productData.images || !Array.isArray(productData.images)) {
      throw new Error('Images must be a valid array of URLs');
    }

    // ذخیره اطلاعات محصول به همراه تصاویر
    const newProduct = { ...productData };
    const product = new this.productModel(newProduct);
    return await product.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(id, productData, { new: true }).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async remove(id: string): Promise<Product> {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }
}
