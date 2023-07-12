import { Args, Int, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { AuthGuard } from 'src/auth/gql-auth.guard';
import { Message, MessageInput } from './signaling.model';
@Resolver()
export class SignalingResolver {
  constructor( 
    @Inject(PUB_SUB)
    private pubSub: RedisPubSub,
  ) {}

  //@UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'signalMessage' })
  async message(
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('message', { type: () => MessageInput }) message: MessageInput,
  ) {
    console.log(channelId, message)
    this.pubSub.publish('signalMessage', {
      signalMessage: message,
      channelId,
    });
    return true;
  }

  @Subscription(() => Message, {
    name: 'signalMessage',
    filter: (payload, variables) => {
      return payload.channelId === variables.channelId;
    },
  })
  messageSub(
    @Args('channelId', { type: () => Int }) channelId: number,
  ) {
    console.log('messageSub', channelId)
    return this.pubSub.asyncIterator('signalMessage');
  }


}
