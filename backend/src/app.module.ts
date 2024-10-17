import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';  // اضافه شده
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartController } from './cart/cart.controller';
import { CartService } from './cart/cart.service';
import { CartSchema } from './cart/cart.schema';
import { OrdersController } from './Order/order.controller';
import { OrdersService } from './Order/orders.service';
import { OrderSchema } from './Order/order.schema';

import { ProductsService } from './products/products.service';
import { ProductsController } from './products/products.controller';
import { ProductSchema } from './products/product.schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UserSchema } from './users/user.schema';
import { AuthModule } from './auth/auth.module';
import { GalleryController } from './GalleryController';

@Module({
  imports: [
    ConfigModule.forRoot(),  // اضافه شده: بارگذاری فایل .env

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'gallery'),
      serveRoot: '/gallery',
      serveStaticOptions: {
        index: false,
      },
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://127.0.0.1:27017/nestjs-shop',
      }),
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([
      { name: 'Cart', schema: CartSchema },
      { name: 'Order', schema: OrderSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'User', schema: UserSchema },
    ]),

    AuthModule,
  ],
  controllers: [
    AppController,
    CartController,
    OrdersController,
    ProductsController,
    UsersController,
    GalleryController,
  ],
  providers: [AppService, CartService, OrdersService, ProductsService, UsersService],
})
export class AppModule {}
