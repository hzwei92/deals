import { Args, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { Post } from './post.model';
import { User } from 'src/users/user.model';
import { PostsService } from './posts.service';
import { UsersService } from 'src/users/users.service';
import { Channel } from 'src/channels/channel.model';
import { ChannelsService } from 'src/channels/channels.service';
import { Inject, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ApnService } from 'src/apn/apn.service';
import { MembershipsService } from 'src/memberships/memberships.service';
import { DevicesService } from 'src/devices/devices.service';
import { CreatePostResult } from './dto/create-post-result.dto';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly channelsService: ChannelsService,
    private readonly membershipsService: MembershipsService,
    private readonly devicesService: DevicesService,
    private readonly apnService: ApnService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => User, { name: 'user' })
  getUser(
    @Parent() post: Post
  ) {
    return this.usersService.findOne(post.userId);
  }

  @ResolveField(() => Channel, { name: 'channel' })
  getChannel(
    @Parent() post: Post
  ) {
    return this.channelsService.findOne(post.channelId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => CreatePostResult, { name: 'createPost' })
  async createPost(
    @Args('deviceId', { type: () => Int, nullable: true} ) deviceId: number,
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('text') text: string,
    @CurrentUser() user: UserEntity,
  ) {
    const post = await this.postsService.createOne(user.id, channelId, text);
    this.pubSub.publish('postUpdated', { postUpdated: post });

    const channel = await this.channelsService.findOne(channelId);

    const saved = await this.membershipsService.findSavedByChannelId(channelId);
    const devices = await this.devicesService.findByUserIds(saved.map(m => m.userId));
    const dedupedDevices = [... new Set(devices)];

    console.log('dedupedDevices', dedupedDevices);

    dedupedDevices.forEach((device) => {
      if (device.id === deviceId || device.userId === user.id) {
        return;
      }
      this.apnService.sendNotification(device.apnToken, {
        title: channel.name,
        body: `${user.name}: ${text}`,
        channelId,
      });
    });

    let membership = await this.membershipsService.findOneByUserIdAndChannelId(user.id, channelId);
    membership = await this.membershipsService.setIsSaved(membership, true);

    return {
      post, 
      membership,
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => [Post], { name: 'getChannelPosts' })
  getChannelPosts(
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('createdAt', { type: () => String, nullable: true }) createdAt: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.postsService.findByChannelId(channelId, createdAt);
  }

  @Subscription(() => Post, { 
    name: 'postUpdated', 
    filter: (payload, variables) => {
      return variables.channelIds.some((channelId) => channelId === payload.postUpdated.channelId);
    }
  })
  postUpdated(
    @Args('channelIds', { type: () => [Int] }) channelIds: number[],
  ) {
    console.log('postUpdated', channelIds)
    return this.pubSub.asyncIterator('postUpdated');
  }
}
