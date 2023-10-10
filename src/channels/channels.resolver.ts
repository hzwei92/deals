import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Float, Int, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Channel } from './channel.model';
import { ChannelsService } from './channels.service';
import { JoinChannelResult } from './dto/join-channel-result.dto';
import { MembershipsService } from 'src/memberships/memberships.service';
import { ActivateChannelResult } from './dto/activate-channel-result.dto';

@Resolver(() => Channel)
export class ChannelsResolver {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
    private readonly membershipService: MembershipsService,
  ) {}

  @Mutation(() => Channel, {name: 'getChannel'})
  async getChannel(
    @Args('id', {type: () => Int }) id: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.channelsService.findOne(id);
  }
  
  @Mutation(() => [Channel], {name: 'getActiveChannels'})
  async getActiveChannels(
    @Args('lng', { type: () => Float }) lng: number,
    @Args('lat', { type: () => Float }) lat: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.channelsService.findActive();
  }

  @UseGuards(AuthGuard)
  @Mutation(() => JoinChannelResult, {name: 'createChannel'})
  async createChannel(
    @Args('lng', { type: () => Float }) lng: number,
    @Args('lat', { type: () => Float }) lat: number,
    @CurrentUser() user: UserEntity
  ) {
    const channel = await this.channelsService.createOne(user, lng, lat);
    const membership = await this.membershipService.createOne(user, channel);

    return {
      channel,
      membership,
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => JoinChannelResult, { name: 'joinChannel' })
  async joinChannel(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity,
  ) {
    const channel = await this.channelsService.findOne(channelId);
    if (!channel) {
      throw new BadRequestException('Channel not found');
    }

    let membership = await this.membershipService.findOneByUserIdAndChannelId(user.id, channelId);
    if (!membership) {
      membership = await this.membershipService.createOne(user, channel);
    }
    return {
      channel,
      membership,
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => JoinChannelResult, { name: 'leaveChannel' })
  async leaveChannel(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity,
  ) {
    let channel = await this.channelsService.findOne(channelId);
    if (!channel) {
      throw new BadRequestException('Channel not found');
    }

    let membership = await this.membershipService.findOneByUserIdAndChannelId(user.id, channelId);
    if (!membership) {
      throw new BadRequestException('Membership not found');
    }

    membership = await this.membershipService.deleteOne(membership);
    channel = await this.channelsService.incrementMemberCount(channelId, -1);

    return {
      channel,
      membership,
    };
  }

  @UseGuards(AuthGuard)
  @Mutation(() => ActivateChannelResult, { name: 'activateChannel' })
  async activateChannel(
    @Args('channelId', { type: () => Int, nullable: true }) channelId: number,
    @CurrentUser() user: UserEntity,
  ) {
    const channels = [];
    const memberships = [];

    if (channelId === user.activeChannelId) {
      return {
        user,
        channels,
        memberships,
      };
    }

    if (user.activeChannelId) {
      let membership0 = await this.membershipService.findOneByUserIdAndChannelId(user.id, user.activeChannelId);
      if (!membership0) {
        throw new Error('Currently active membership not found');
      }
      membership0 = await this.membershipService.setIsActive(membership0.id, false);
      memberships.push(membership0);
    }

    if (channelId) {
      let membership1 = await this.membershipService.findOneByUserIdAndChannelId(user.id, channelId);
      if (!membership1) {
        throw new Error('Target membership to activate not found');
      }
      membership1 = await this.membershipService.setIsActive(channelId, true);
      memberships.push(membership1);
    }

    const user1 = await this.usersService.setActiveChannelId(user.id, channelId);
    
    return {
      user: user1,
      channels,
      memberships,
    };
  }
}
