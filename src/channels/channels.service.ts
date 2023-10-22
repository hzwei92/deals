import { BadRequestException, Injectable } from '@nestjs/common';
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

  async findOneByUrl(url: string): Promise<Channel> {
    return this.channelsRepository.findOne({
      where: {
        url,
      },
    });
  }

  async find(): Promise<Channel[]> {
    return this.channelsRepository.find();
  }

  async findActive(): Promise<Channel[]> {
    return this.channelsRepository.find({
      where: {
        activeUserCount: MoreThan(0),
      }
    });
  }

  async createOne(user: User, lng: number, lat: number, name: string, url: string, detail: string): Promise<Channel> {
    const channel0 = await this.findOneByUrl(url);
    if (channel0) {
      throw new BadRequestException('URL already in use');
    }
    
    const channel = await this.channelsRepository.create({
      name,
      url,
      detail,
      ownerId: user.id,
      lng,
      lat,
    });
    return this.channelsRepository.save(channel);
  }

  async incrementMemberCount(id: number, delta: number) {
    const channel = await this.findOne(id);
    channel.memberCount += delta;
    if (channel.memberCount < 0) {
      channel.memberCount = 0;
    }
    return this.channelsRepository.save(channel);
  }

  async incrementActiveUserCount(id: number, delta: number) {
    const channel = await this.findOne(id);
    channel.activeUserCount += delta;
    if (channel.activeUserCount < 0) {
      channel.activeUserCount = 0;
    }
    return this.channelsRepository.save(channel);
  }
}
