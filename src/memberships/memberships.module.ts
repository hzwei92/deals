import { Module, forwardRef } from '@nestjs/common';
import { MembershipsResolver } from './memberships.resolver';
import { MembershipsService } from './memberships.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './membership.entity';
import { UsersModule } from 'src/users/users.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membership]),
    JwtModule.register({}),
    UsersModule,
    forwardRef(() => ChannelsModule),
  ],
  providers: [MembershipsResolver, MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
