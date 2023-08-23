import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Float, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Channel } from './channel.model';
import { ChannelsService } from './channels.service';
import { JoinChannelResult } from './dto/join-channel-result.dto';

@Resolver(() => Channel)
export class ChannelsResolver {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField(() => User, {name: 'owner'})
  async getOwner(
    @Parent() channel: Channel
  ) {
    return this.usersService.findOne(channel.ownerId);
  }

  @Mutation(() => Channel, {name: 'getChannel'})
  async getChannel(
    @Args('id', {type: () => Int }) id: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.channelsService.findOne(id);
  }
  
  @Mutation(() => [Channel], {name: 'getChannels'})
  async getChannels(
    @Args('lng', { type: () => Float }) lng: number,
    @Args('lat', { type: () => Float }) lat: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.channelsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Channel, {name: 'createChannel'})
  async createChannel(
    @Args('lng', { type: () => Float }) lng: number,
    @Args('lat', { type: () => Float }) lat: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.channelsService.createOne(user, lng, lat);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => JoinChannelResult, { name: 'joinChannel' })
  async joinChannel(
    @Args('channelId', { type: () => Int, nullable: true }) channelId: number,
    @CurrentUser() user: UserEntity,
  ) {
    const channels = [];

    if (channelId === user.liveChannelId) {
      return {
        user,
        channels,
      };
    }

    if (user.liveChannelId) {
      let channel0 = await this.channelsService.incrementLiveUserCount(user.liveChannelId, -1)
      channels.push(channel0);
    }

    if (channelId) {
      const channel = await this.channelsService.findOne(channelId);
      if (!channel) throw new BadRequestException('Channel not found');
      const channel1 = await this.channelsService.incrementLiveUserCount(channelId, 1);
      channels.push(channel1);
    }

    const user1 = await this.usersService.setLiveChannelId(user.id, channelId);
    
    return {
      user: user1,
      channels,
    };
  }
}
