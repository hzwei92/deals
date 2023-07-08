import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { RefreshTokentResult } from './dto/refresh-token-result.dto';
import { VerifyResult } from './dto/verify-result.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => User, { name: 'login' })
  async login(
    @Args('phone') phone: string,
  ) {
    let user = await this.usersService.findOne(phone);
    if (!user) {
      user = await this.usersService.createOne(phone);
    }

    await this.authService.login(phone);

    return user;
  }

  @Mutation(() => VerifyResult, { name: 'verify' })
  async verify(
    @Args('phone') phone: string,
    @Args('code') code: string,
  ) {
    return this.authService.verify(phone, code);
  }
    
  @Mutation(() => User, { name: 'resend' })
  async resend(
    @Args('phone') phone: string,
  ) {
    const user = await this.usersService.findOne(phone);

    if (!user) {
      throw new Error('User not found');
    }

    await this.authService.login(phone);

    return user;
  }

  @Mutation(() => User, { name: 'logout' })
  async logout(
    @Args('phone') phone: string,
  ) {
    await this.usersService.setRefreshToken(phone, null);
  }

  @Mutation(() => RefreshTokentResult, { name: 'refresh' })
  async refresh(
    @Args('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(refreshToken);
  }
}
