import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/images/image.entity';
import { Repository } from 'typeorm';
import { Deal } from './deal.entity';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealsRepository: Repository<Deal>,
  ) {}

  async createOne(name: string, detail: string, price: number, discountPrice: number, image: Image): Promise<Deal> {
    const deal = await this.dealsRepository.create({
      name,
      detail,
      price,
      discountPrice,
      image,
    });
    console.log('deal', deal);
    return this.dealsRepository.save(deal);
  }
  
  async findAll(): Promise<Deal[]> {
    return this.dealsRepository.find();
  }
}
