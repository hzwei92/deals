import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { ApnModule } from 'src/apn/apn.module';
import { DevicesModule } from 'src/devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    JwtModule.register({}),
    UsersModule,
    ChannelsModule,
    DevicesModule,
    PubSubModule,
    ApnModule,
  ],
  providers: [PostsService, PostsResolver]
})
export class PostsModule {}
