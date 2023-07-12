import { Args, Int, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { Message, MessageInput } from './signaling.model';
import { User as UserEntity } from 'src/users/user.entity';
@Resolver()
export class SignalingResolver {
  constructor( 
    @Inject(PUB_SUB)
    private pubSub: RedisPubSub,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'signalMessage' })
  async message(
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('message', { type: () => MessageInput }) message: MessageInput,
    @CurrentUser() user: UserEntity,
  ) {
    console.log(channelId, message)
    this.pubSub.publish('signalMessage', {
      signalMessage: message,
      userId: user.id,
      channelId,
    });
    return true;
  }

  @Subscription(() => Message, {
    name: 'signalMessage',
    filter: (payload, variables) => {
      return payload.channelId === variables.channelId && payload.userId !== variables.userId;
    },
  })
  messageSub(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('channelId', { type: () => Int }) channelId: number,
  ) {
    console.log('messageSub', userId, channelId)
    return this.pubSub.asyncIterator('signalMessage');
  }


}
