import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';
import { UsersService } from './users.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => User, { name: 'user' })
  async user(
    @CurrentUser() user: UserEntity
  ){
    return user;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User, { name: 'changeName' })
  async changeName(
    @CurrentUser() user: UserEntity,
    @Args('name') name: string,
  ) {
    return this.usersService.changeName(user, name);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User, { name: 'setUserCam' })
  async updateCamStatus(
    @CurrentUser() user: UserEntity,
    @Args('isCamOn') isCamOn: boolean,
  ) {
    return this.usersService.updateCamStatus(user, isCamOn);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User, { name: 'setUserMic' })
  async updateMicStatus(
    @CurrentUser() user: UserEntity,
    @Args('isMicOn') isMicOn: boolean,
  ) {
    return this.usersService.updateMicStatus(user, isMicOn);
  }

  
}
