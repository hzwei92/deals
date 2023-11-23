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
  async findOneByUserIdAndApnsToken(userId: number, apnsToken: string) {
    return this.devicesRepository.findOne({ where: {
      userId, apnsToken 
    }});
  }

  async addDevice(user: User, apnsToken: string) {
    let device = await this.findOneByUserIdAndApnsToken(user.id, apnsToken);
    if (device) {
      return device;
    }
    device = new Device();
    device.userId = user.id;
    device.apnsToken = apnsToken;
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
