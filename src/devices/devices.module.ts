import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesResolver } from './devices.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    JwtModule.register({}),
    UsersModule,
  ],
  providers: [DevicesService, DevicesResolver],
  exports: [DevicesService],
})
export class DevicesModule {}
