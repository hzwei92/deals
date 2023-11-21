import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { RefreshTokentResult } from './dto/refresh-token-result.dto';
import { VerifyResult } from './dto/verify-result.dto';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from './gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => VerifyResult, { name: 'facebookAuth' })
  async facebookAuth(
    @Args('credential') credential: string,
  ) {
    return this.authService.facebookAuth(credential);
  }
  
  @Mutation(() => VerifyResult, { name: 'googleAuth' })
  async googleAuth(
    @Args('credential') credential: string,
    @Args('ios') ios: boolean,
  ) {
    return this.authService.googleAuth(credential, ios);
  }

  @Mutation(() => User, { name: 'emailLogin' })
  async emailLogin(
    @Args('email') email: string,
  ) {
    let user = await this.usersService.findOneByEmail(email);
    if (!user) {
      user = await this.usersService.createOne(email);
    }

    await this.authService.emailLogin(user);

    return user;
  }

  @Mutation(() => VerifyResult, { name: 'verify' })
  async verify(
    @Args('id', { type: () => Int }) id: number,
    @Args('code') code: string,
  ) {
    return this.authService.verify(id, code);
  }
    
  @Mutation(() => User, { name: 'resend' })
  async resend(
    @Args('email', { nullable: true}) email: string,
    @Args('phone', { nullable: true}) phone: string,
  ) {
    if (!email && !phone) {
      throw new BadRequestException('Must provide either email or phone');
    }
    if (phone) {
      const user = await this.usersService.findOneByPhone(phone);
      if (!user) {
        throw new Error('User not found');
      }
      await this.authService.phoneLogin(user);
      return user;
    }
    if (email) {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      await this.authService.emailLogin(user);
      return user;
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'logout' })
  async logout(
    @CurrentUser() user: UserEntity,
  ) {
    await this.usersService.setRefreshToken(user.id, null);
  }

  @Mutation(() => RefreshTokentResult, { name: 'refresh' })
  async refresh(
    @Args('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshToken(refreshToken);
  }
}
