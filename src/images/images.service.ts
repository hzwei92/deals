import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>
  ) {}

  async createOne(file: Express.Multer.File) {
    const image = await this.imagesRepository.create({
      data: file.buffer,
    });
    return this.imagesRepository.save(image);
  }
  
  async findOne(id: number): Promise<Image> {
    return this.imagesRepository.findOneBy({ id });
  }

}
