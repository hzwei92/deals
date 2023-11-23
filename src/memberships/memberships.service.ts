import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from './membership.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Channel } from 'src/channels/channel.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipsRepository: Repository<Membership>,
  ) {}

  async findOneByUserIdAndChannelId(userId: number, channelId: number): Promise<Membership | null> {
    return this.membershipsRepository.findOne({
      where: {
        userId,
        channelId,
      },
    });
  }

  async findByUserId(userId: number): Promise<Membership[]> {
    return this.membershipsRepository.find({
      where: {
        userId,
      },
    });
  }

  async findByChannelId(channelId: number): Promise<Membership[]> {
    return this.membershipsRepository.find({
      where: {
        channelId,
      },
    });
  }

  async findSavedByChannelId(channelId: number): Promise<Membership[]> {
    return this.membershipsRepository.find({
      where: {
        channelId,
        isSaved: true,
      },
    });
  }

  async findOne(id: number): Promise<Membership | null> {
    return this.membershipsRepository.findOne({
      where: { id }
    });
  }

  async createOne(user: User, channel: Channel, isOwner: boolean): Promise<Membership> {
    const membership = await this.membershipsRepository.create({
      userId: user.id,
      channelId: channel.id,
      isOwner,
    });
    return this.membershipsRepository.save(membership);
  }

  async deleteOne(membership: Membership) {
    if (!membership) throw new Error('Membership not found');

    membership.deletedAt = new Date();
    return this.membershipsRepository.save(membership);
  }

  async setIsActive(membership: Membership, isActive: boolean) {
    membership.isActive = isActive;
    return this.membershipsRepository.save(membership);
  }

  async setIsSaved(membership: Membership, isSaved: boolean) {
    membership.isSaved = isSaved;
    return this.membershipsRepository.save(membership);
  }
}
