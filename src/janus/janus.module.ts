import { Module } from '@nestjs/common';
import { JanusService } from './janus.service';
import { JanusResolver } from './janus.resolver';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    PubSubModule,
    JwtModule.register({}),
    UsersModule,
  ],
  providers: [JanusService, JanusResolver]
})
export class JanusModule {}
