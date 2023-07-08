import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createOne(userId: number, dealId: number, price: number) {
    const order = await this.orderRepository.create({ 
      purchaserId: userId, 
      dealId, 
      price,
    });

    await this.orderRepository.save(order);
    return order;
  }
}
