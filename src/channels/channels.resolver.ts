import { BadRequestException, Inject, UseGuards } from '@nestjs/common';
import { Args, Float, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Channel } from './channel.model';
import { ChannelsService } from './channels.service';
import { JoinChannelResult } from './dto/join-channel-result.dto';
import { MembershipsService } from 'src/memberships/memberships.service';
import { ActivateChannelResult } from './dto/activate-channel-result.dto';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Membership } from 'src/memberships/membership.model';
import { DevicesService } from 'src/devices/devices.service';
import { ApnService } from 'src/apn/apn.service';

@Resolver(() => Channel)
export class ChannelsResolver {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
    private readonly membershipService: MembershipsService,
    private readonly devicesService: DevicesService,
    private readonly apnService: ApnService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @ResolveField(() => [Membership], { name: 'memberships' })
  getMemberships(
    @Parent() channel: Channel
  ) {
    return this.membershipService.findByChannelId(channel.id);
  }

  @Mutation(() => Channel, {name: 'getChannel', nullable: true})
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
    return this.channelsService.find();
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
    @Args('name', { type: () => String }) name: string,
    @Args('url', { type: () => String }) url: string,
    @Args('desc', { type: () => String }) desc: string,
    @CurrentUser() user: UserEntity
  ) {
    const channel = await this.channelsService.createOne(user, lng, lat, name, url, desc);
    const membership = await this.membershipService.createOne(user, channel, true);

    return {
      channel,
      membership,
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Channel, { name: 'joinChannel' })
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
      membership = await this.membershipService.createOne(user, channel, false);
    }
    return channel;
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
    @Args('deviceId', { type: () => Int, nullable: true}) deviceId: number,
    @Args('channelId', { type: () => Int, nullable: true }) channelId: number,
    @CurrentUser() user: UserEntity,
  ) {
    console.log('activateChannel', user.activeChannelId, channelId);

    const channels = [];
    const memberships = [];

    if (channelId === user.activeChannelId) {
      return {
        user,
        channels,
        memberships,
      };
    }

    const user1 = await this.usersService.setActiveChannelId(user.id, channelId);

    if (user.activeChannelId) {
      let membership0 = await this.membershipService.findOneByUserIdAndChannelId(user.id, user.activeChannelId);
      if (!membership0) {
        throw new Error('Prev active membership not found');
      }
      membership0 = await this.membershipService.setIsActive(membership0, false);
      memberships.push(membership0);

      this.pubSub.publish('membershipUpdated', {
        membershipUpdated: membership0,
      });

      const channel0 = await this.channelsService.incrementActiveUserCount(user.activeChannelId, -1);
      channels.push(channel0);

      this.pubSub.publish('channelUpdated', {
        channelUpdated: channel0,
      });
    }

    if (channelId) {
      const channel1 = await this.channelsService.incrementActiveUserCount(channelId, 1);
      channels.push(channel1);

      this.pubSub.publish('channelUpdated', {
        channelUpdated: channel1,
      });

      let membership1 = await this.membershipService.findOneByUserIdAndChannelId(user.id, channelId);
      if (!membership1) {
        membership1 = await this.membershipService.createOne(user, channel1, false);
      }
      membership1 = await this.membershipService.setIsActive(membership1, true);
      memberships.push(membership1);

      this.pubSub.publish('membershipUpdated', {
        membershipUpdated: membership1,
      });

      const saved = await this.membershipService.findSavedByChannelId(channelId);
      const devices = await this.devicesService.findByUserIds(saved.map(m => m.userId));

      const dedupedDevices = [...new Set(devices)];

      console.log('dedupedDevices', dedupedDevices);
      dedupedDevices.forEach((device) => {
        if (device.id === deviceId || device.userId === user.id) {
          return;
        }

        this.apnService.sendNotification(device.apnToken, {
          title: channel1.name,
          body: `${user.name} joined the call`,
          channelId,
        });
      });
    }
    
    return {
      user: user1,
      channels,
      memberships,
    };
  }

  @Subscription(() => Channel, { 
    name: 'channelUpdated', 
    filter: (payload, variables) => {
      return (
        payload.channelUpdated.lng >= variables.minLng && 
        payload.channelUpdated.lng <= variables.maxLng && 
        payload.channelUpdated.lat >= variables.minLat && 
        payload.channelUpdated.lat <= variables.maxLat
      );
    }
  })
  channelUpdated(
    @Args('minLng', { type: () => Float }) minLng: number,
    @Args('maxLng', { type: () => Float }) maxLng: number,
    @Args('minLat', { type: () => Float }) minLat: number,
    @Args('maxLat', { type: () => Float }) maxLat: number,
  ) {
    console.log('channelUpdated', minLng, maxLng, minLat, maxLat)
    return this.pubSub.asyncIterator('channelUpdated');
  }
}
