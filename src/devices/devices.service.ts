import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { In, Repository } from 'typeorm';
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

  async findByUserIds(userIds: number[]) {
    return this.devicesRepository.find({
      where: {
        userId: In(userIds),
      }
    });
  }

  async findByApnToken(apnToken: string) {
    return this.devicesRepository.find({
      where: {
        apnToken,
      }
    });
  }

  async addDevice(user: User, apnToken: string) {
    const devices = await this.findByApnToken(apnToken);
    devices.forEach(device => {
      device.deletedAt = new Date();
    });
    await this.devicesRepository.save(devices);
    
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
