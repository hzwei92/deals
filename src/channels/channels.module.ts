import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsResolver } from './channels.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { MembershipsModule } from 'src/memberships/memberships.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    JwtModule.register({}),
    UsersModule,
    MembershipsModule,
  ],
  providers: [ChannelsService, ChannelsResolver],
  exports: [ChannelsService]
})
export class ChannelsModule {}
