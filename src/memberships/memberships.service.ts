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

  async findOne(id: number): Promise<Membership | null> {
    return this.membershipsRepository.findOne({
      where: { id }
    });
  }

  async createOne(user: User, channel: Channel) {
    const membership = await this.membershipsRepository.create({
      userId: user.id,
      channelId: channel.id,
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

  async setSavedIndex(user: User, membershipId: number, index: number | null) {
    const membership = await this.findOne(membershipId);
    if (!membership) throw new Error('Membership not found');
    if (membership.userId !== user.id) throw new Error('Membership does not belong to user');
    if (membership.savedIndex === index) return [];

    const memberships = await this.findByUserId(membership.userId);
    const memberships1 = [];

    if (index !== null) {
      if (membership.savedIndex !== null) {
        if (membership.savedIndex < index) {
          memberships.forEach((m) => {
            if (m.savedIndex !== null && m.savedIndex > membership.savedIndex && m.savedIndex <= index) {
              m.savedIndex -= 1;
              memberships1.push(m);
            }
          })
        }
        else if (membership.savedIndex > index) {
          memberships.forEach((m) => {
            if (m.savedIndex !== null && m.savedIndex < membership.savedIndex && m.savedIndex >= index) {
              m.savedIndex += 1;
              memberships1.push(m);
            }
          })
        }
      }
      else {
        memberships.forEach((m) => {
          if (m.savedIndex !== null && m.savedIndex >= index) {
            m.savedIndex += 1;
            memberships1.push(m);
          }
        })
      }
    }
    else {
      memberships.forEach((m) => {
        if (m.savedIndex !== null && m.savedIndex > membership.savedIndex) {
          m.savedIndex -= 1;
          memberships1.push(m);
        }
      });
    }

    membership.savedIndex = index;
    memberships1.push(membership);

    return this.membershipsRepository.save(memberships1);
  }
}
