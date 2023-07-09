import { UseGuards } from '@nestjs/common';
import { Args, Float, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Channel } from './channel.model';
import { ChannelsService } from './channels.service';

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

  @UseGuards(AuthGuard)
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
}
