import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Post } from './post.model';
import { User } from 'src/users/user.model';
import { PostsService } from './posts.service';
import { UsersService } from 'src/users/users.service';
import { Channel } from 'src/channels/channel.model';
import { ChannelsService } from 'src/channels/channels.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly channelsService: ChannelsService,
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
  createPost(
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('text') text: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.postsService.createOne(user.id, channelId, text);
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
}
