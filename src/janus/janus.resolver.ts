import { Args, Float, Int, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { CandidateInput, ConfigureResponse, JoinResponse, JsepInput, SubscribeResponse } from './janus.model';
import { JanusService } from './janus.service';
import { Inject, UseGuards } from '@nestjs/common';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';

@Resolver()
export class JanusResolver {
  constructor(
    private readonly janusService: JanusService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'join' })
  async join(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.join(user.id, channelId, {
      room: channelId,
      display: user.id.toString(),
    }, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'subscribe' })
  async subscribe(
    @Args('feed', { type: () => Float }) feed: number,
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('sc_substream_layer', { type: () => Int, nullable: true }) sc_substream_layer: number,
    @Args('sc_temporal_layers', { type: () => Int, nullable: true }) sc_temporal_layers: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.subscribe(user.id, channelId, {
      feed,
      room: channelId,
      sc_substream_layer,
      sc_temporal_layers,
    }, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'publish' })
  async publish(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.publish(user.id, channelId, {}, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'configure' })
  async configure(
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('feed', { type: () => Float }) feed: number,
    @Args('audio', { type: () => Boolean }) audio: boolean,
    @Args('video', { type: () => Boolean }) video: boolean,
    @Args('data', { type: () => Boolean }) data: boolean,
    @Args('jsep', { type: () => JsepInput, nullable: true }) jsep: JsepInput,
    @Args('restart', { type: () => Boolean, nullable: true }) restart: boolean,
    @Args('sc_substream_layer', { type: () => Int, nullable: true }) sc_substream_layer: number,
    @Args('sc_temporal_layers', { type: () => Int, nullable: true }) sc_temporal_layers: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.configure(user.id, channelId, {
      room: channelId,
      feed,
      audio,
      video,
      data,
      jsep,
      restart,
      sc_substream_layer,
      sc_temporal_layers,
    }, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'unpublish' })
  async unpublish(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.unpublish(user.id, channelId, {}, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'leave' })
  async leave(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.leave(user.id, channelId, {}, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'start' })
  async start(
    @Args('feed', { type: () => Float }) feed: number,
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('jsep', { type: () => JsepInput }) jsep: JsepInput,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.start(user.id, channelId, {
      feed,
      room: channelId,
    }, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'pause' })
  async pause(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.pause(user.id, channelId, {}, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'switch' })
  async switch(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.switch(user.id, channelId, {}, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'trickle' })
  async trickle(
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('feed', { type: () => Float }) feed: number,
    @Args('candidate', { type: () => CandidateInput }) candidate: CandidateInput,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.trickle(user.id, channelId, {
      room: channelId,
      candidate,
      feed,
    }, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'trickleComplete' })
  async trickleComplete(
    @Args('channelId', { type: () => Int }) channelId: number,
    @Args('feed', { type: () => Float }) feed: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.trickleComplete(user.id, channelId, {
      room: channelId,
      feed,
    }, this.pubSub);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'disconnect' })
  async disconnect(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.disconnect(user.id, channelId, {}, this.pubSub);
  }

  // management API
  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'create' })
  async create(
    @Args('channelId', { type: () => Int }) channelId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.janusService.create(user.id, channelId, {}, this.pubSub);
  }

  @Subscription(() => JoinResponse, { 
    name: 'joined', 
    filter: (payload, variables) => payload.channelId === variables.channelId
  })
  joinSub(
    @Args('userId', { type: () => Int, nullable: true }) userId: number,
    @Args('channelId', { type: () => Int, nullable: true }) channelId: number,
  ) {
    console.log('joinSub', userId, channelId)
    return this.pubSub.asyncIterator('joined');
  }

  @Subscription(() => ConfigureResponse, { 
    name: 'configured', 
    filter: (payload, variables) => payload.channelId === variables.channelId
  })
  configureSub(
    @Args('userId', { type: () => Int, nullable: true }) userId: number,
    @Args('channelId', { type: () => Int, nullable: true }) channelId: number,
  ) {
    console.log('configureSub', userId, channelId)
    return this.pubSub.asyncIterator('configured');
  }

  @Subscription(() => SubscribeResponse, { 
    name: 'subscribed', 
    filter: (payload, variables) => payload.channelId === variables.channelId
  })
  subscribeSub(
    @Args('userId', { type: () => Int, nullable: true }) userId: number,
    @Args('channelId', { type: () => Int, nullable: true }) channelId: number,
  ) {
    console.log('subscribeSub', userId, channelId)
    return this.pubSub.asyncIterator('subscribed');
  }
}
