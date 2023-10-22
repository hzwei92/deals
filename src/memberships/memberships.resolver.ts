import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Membership } from './membership.model';
import { MembershipsService } from './memberships.service';
import { UsersService } from 'src/users/users.service';
import { UseGuards } from '@nestjs/common';
import { Channel } from 'src/channels/channel.model';
import { ChannelsService } from 'src/channels/channels.service';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { User } from 'src/users/user.model';

@Resolver(() => Membership)
export class MembershipsResolver {
  constructor(
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
    private readonly channelsService: ChannelsService,
  ) {}

  @ResolveField(() => User, { name: 'user' }) 
  getUser(
    @Parent() membership: Membership
  ) {
    return this.usersService.findOne(membership.userId);
  } 

  @ResolveField(() => Channel, { name: 'channel' })
  getChannel(
    @Parent() membership: Membership
  ) {
    return this.channelsService.findOne(membership.channelId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => [Membership], { name: 'getMemberships' })
  getMemberships(
    @CurrentUser() user: UserEntity
  ) {
    return this.membershipsService.findByUserId(user.id);
  }
  
  @UseGuards(AuthGuard)
  @Mutation(() => [Membership], { name: 'getUserMemberships' })
  getUserMemberships(
    @Args('userId', { type: () => Int}) userId:  number,
  ) {
    return this.membershipsService.findByChannelId(userId);
  }

  @Mutation(() => [Membership], { name: 'getChannelMemberships' })
  getChannelMembershipsByChannel(
    @Args('channelId', { type: () => Int}) channelId:  number,
  ) {
    return this.membershipsService.findByChannelId(channelId);
  }
}
