import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { VerifyResult } from './dto/verify-result.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => User, { name: 'login' })
  async login(
    @Args('mobile') mobile: string,
  ) {
    let user = await this.usersService.findOne(mobile);
    if (!user) {
      user = await this.usersService.createOne(mobile);
    }

    await this.authService.login(mobile);

    return user;
  }

  @Mutation(() => VerifyResult, { name: 'verify' })
  async verify(
    @Args('mobile') mobile: string,
    @Args('code') code: string,
  ) {
    return this.authService.verify(mobile, code);
  }
    
  @Mutation(() => User, { name: 'resend' })
  async resend(
    @Args('mobile') mobile: string,
  ) {
    const user = await this.usersService.findOne(mobile);

    if (!user) {
      throw new Error('User not found');
    }

    await this.authService.login(mobile);

    return user;
  }

  @Mutation(() => User, { name: 'logout' })
  async logout(
    @Args('mobile') mobile: string,
  ) {
    await this.usersService.setRefreshToken(mobile, null);
  }

  @Mutation(() => String, { name: 'refresh' })
  async refresh(
    @Args('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(refreshToken);
  }
}
