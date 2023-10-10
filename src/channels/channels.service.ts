import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { adjectives, uniqueNamesGenerator } from 'unique-names-generator';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
  ) {}

  async findOne(id: number): Promise<Channel> {
    return this.channelsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findActive(): Promise<Channel[]> {
    return this.channelsRepository.find({
      where: {
        activeUserCount: MoreThan(0),
      }
    });
  }

  async createOne(user: User, lng: number, lat: number): Promise<Channel> {
    const name = uniqueNamesGenerator({
      dictionaries: [adjectives],
      style: 'upperCase',
    }) + '-' + Math.random().toString().substring(2, 5);
    const channel = await this.channelsRepository.create({
      name,
      ownerId: user.id,
      lng,
      lat,
    });
    return this.channelsRepository.save(channel);
  }

  async incrementMemberCount(id: number, delta: number) {
    await this.channelsRepository.increment({ id }, 'memberCount', delta);
    return this.channelsRepository.findOne({ where: { id }});
  }
  
  async incrementActiveUserCount(id: number, delta: number) {
    await this.channelsRepository.increment({ id }, 'activeUserCount', delta);
    return this.channelsRepository.findOne({ where: { id }});
  }
}
