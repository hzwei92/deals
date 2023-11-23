import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Device } from './device.model';
import { DevicesService } from './devices.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';

@Resolver(() => Device)
export class DevicesResolver {
  constructor(
    private readonly devicesService: DevicesService,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Device)
  async addDevice(
    @CurrentUser() user: UserEntity,
    @Args('apnsToken') apnsToken: string,
  ) {
    return this.devicesService.addDevice(user, apnsToken);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  async removeDevice(
    @CurrentUser() user: UserEntity,
    @Args('deviceId', { type: () => Int }) id: number,
  ) {
    return this.devicesService.removeDevice(user, id);
  }
}
