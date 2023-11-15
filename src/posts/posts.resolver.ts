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

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly channelsService: ChannelsService,
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
  @Mutation(() => Post, { name: 'createPost' })
  async createPost(
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('text') text: string,
    @CurrentUser() user: UserEntity,
  ) {
    const post = await this.postsService.createOne(user.id, channelId, text);
    this.pubSub.publish('postUpdated', { postUpdated: post });
    return post;
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
