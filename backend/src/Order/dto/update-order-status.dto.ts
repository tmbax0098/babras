export class CreateOrderDto {
  readonly userId!: string;
  readonly items!: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }[];
  readonly totalPrice!: number;
  readonly status!: 'Pending' | 'Processing' | 'Completed';
  readonly name!: string;
  readonly address!: string;
  readonly phone!: string;
}

export class UpdateOrderStatusDto {
  readonly status!: 'Pending' | 'Processing' | 'Completed';
}