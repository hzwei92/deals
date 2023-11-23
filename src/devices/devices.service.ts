import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly devicesRepository: Repository<Device>,
  ) {}

  async findOne(id: number) {
    return this.devicesRepository.findOne({
      where: {
        id,
      }
    });
  }

  async findByUserId(userId: number) {
    return this.devicesRepository.find({
      where: {
        userId,
      }
    });
  }

  async findByChannelId(channelId: number) {
    return this.devicesRepository.createQueryBuilder('device')
      .where(
        'device.userId IN (SELECT userId FROM memberships WHERE channelId = :channelId AND isSaved = true)', 
        { channelId }
      )
      .getMany();
  }

  async addDevice(user: User, apnToken: string) {
    const device = new Device();
    device.userId = user.id;
    device.apnToken = apnToken;
    return this.devicesRepository.save(device);
  }

  async removeDevice(user: User, id: number) {
    const device = await this.findOne(id);
    if (!device) {
      throw new BadRequestException('Device not found');
    }
    if (device.userId !== user.id) {
      throw new BadRequestException('Not authorized');
    }
    await this.devicesRepository.remove(device);
    return true;
  }
}
