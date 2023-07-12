import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { UsersModule } from 'src/users/users.module';
import { SignalingResolver } from './signaling.resolver';

@Module({
  imports: [
    JwtModule.register({}),
    PubSubModule,
    UsersModule,
  ],
  providers: [SignalingResolver]
})
export class SignalingModule {}
