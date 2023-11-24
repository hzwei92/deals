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

  async findOneByApnToken(apnToken: string) {
    return this.devicesRepository.findOne({
      where: {
        apnToken,
      }
    });
  }

  async addDevice(user: User, apnToken: string): Promise<Device> {
    console.log('addDevice', user, apnToken);
    let device = await this.findOneByApnToken(apnToken);

    if (device) {
      device.userId = user.id;
    }
    else {
      device = await this.devicesRepository.create({
        userId: user.id,
        apnToken,
      });
    }

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
