import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findOne(id: number): Promise<Post> {
    return this.postsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findByChannelId(channelId: number, maxDate: Date, limit: number): Promise<Post[]> {
    maxDate = maxDate || new Date();
    limit = limit || 10;
    return this.postsRepository.find({
      where: {
        channelId,
        createdAt: LessThan(maxDate),
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  async findByUserId(userId: number): Promise<Post[]> {
    return this.postsRepository.find({
      where: {
        userId,
      },
    });
  }

  async createOne(userId: number, channelId: number, text: string): Promise<Post> {
    const post = await this.postsRepository.create({
      userId,
      channelId,
      text,
    });
    return this.postsRepository.save(post);
  }
}
