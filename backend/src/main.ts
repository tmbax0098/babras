import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();  // بارگذاری متغیرهای محیطی از فایل .env

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // دامنه یا پورت مجاز
  });
  await app.listen(process.env.PORT || 3001);  // استفاده از متغیر PORT از .env یا 3001 به عنوان پیش‌فرض
}
bootstrap();
