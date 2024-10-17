import { IsNotEmpty, IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  readonly userId!: string; // استفاده از علامت تعجب


  @IsNotEmpty()
  @Type(() => ItemDto)
  readonly items!: ItemDto[];

  @IsNotEmpty()
  @IsNumber()
  readonly totalPrice!: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['Pending', 'Processing', 'Completed'])
  readonly status!: 'Pending' | 'Processing' | 'Completed';

  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsNotEmpty()
  @IsString()
  readonly address!: string;

  @IsNotEmpty()
  @IsString()
  readonly phone!: string;
}

export class ItemDto {
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Pending', 'Processing', 'Completed'])
  readonly status!: 'Pending' | 'Processing' | 'Completed';
}