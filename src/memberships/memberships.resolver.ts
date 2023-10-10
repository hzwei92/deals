import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Membership } from './membership.model';
import { MembershipsService } from './memberships.service';
import { UsersService } from 'src/users/users.service';
import { BadRequestException } from '@nestjs/common';
import { Channel } from 'src/channels/channel.model';
import { ChannelsService } from 'src/channels/channels.service';

@Resolver(() => Membership)
export class MembershipsResolver {
  constructor(
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
    private readonly channelsService: ChannelsService,
  ) {}

  @ResolveField(() => Channel, { name: 'channel' })
  getChannel(
    @Parent() membership: Membership
  ) {
    return this.channelsService.findOne(membership.channelId);
  }

  @Mutation(() => [Membership], { name: 'getMembershipsByUserId' })
  getMembershipsByUserId(
    @Args('userId', { type: () => Int }) userId: number
  ) {
    const user = this.usersService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found')
    }
    // TODO check the permissions?

    return this.membershipsService.findByUserId(userId);
  }
}
