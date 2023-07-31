import { Args, Int, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { AuthGuard, CurrentUser } from 'src/auth/gql-auth.guard';
import { User as UserEntity } from 'src/users/user.entity';
import { CandidateInput, JsepInput, Room } from './janus.model';
import { JanusService } from './janus.service';
import { Inject, UseGuards } from '@nestjs/common';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';
import { PubJoined } from './dto/PubJoined.dto';
import { SubJoined } from './dto/SubJoined.dto';
import { Configured } from './dto/Configured.dto';
import { Unpublished } from './dto/Unpublished.dto';
import { Kicked } from './dto/Kicked.dto';
import { ParticipantsList } from './dto/ParticipantsList.dto';
import { Leaving } from './dto/Leaving.dto';
import { Created } from './dto/Created.dto';
import { Destroyed } from './dto/Destroyed.dto';
import { Exists } from './dto/Exists.dto';
import { RtpFwdStarted } from './dto/RtpFwdStarted.dto';
import { RtpFwdStopped } from './dto/RtpFwdStopped.dto';
import { RtpFwdList } from './dto/RtpFwdList.dto';
import { MyError } from './dto/MyError.dto';
import { PubList } from './dto/PubList.dto';
import { PubPeerJoined } from './dto/PubPeerJoined.dto';
import { Display } from './dto/Display.dto';
import { Allowed } from './dto/Allowed.dto';
import { RoomsList } from './dto/RoomsList.dto';
import { Talking } from './dto/Talking.dto';
import { Started } from './dto/Started.dto';
import { Paused } from './dto/Paused.dto';
import { Switched } from './dto/Switched.dto';

@Resolver()
export class JanusResolver {
  constructor(
    private readonly janusService: JanusService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(() => PubJoined, { name: 'join' })
  async join(
    @Args('room', { type: () => Int }) room: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.join({
      room,
      feed: user.id,
      display: user.name || 'anon'
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => SubJoined, { name: 'subscribe' })
  async subscribe(
    @Args('room', { type: () => Int }) room: number,
    @Args('feed', { type: () => Int }) feed: number,
    @Args('audio', {nullable: true}) audio: boolean,
    @Args('video', {nullable: true}) video: boolean,
    @Args('data', {nullable: true}) data: boolean,
    @Args('sc_substream_layer', { type: () => Int, nullable: true }) sc_substream_layer: number,
    @Args('sc_temporal_layers', { type: () => Int, nullable: true }) sc_temporal_layers: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.subscribe({
      feed,
      room, 
      audio,
      video,
      data,
      sc_substream_layer,
      sc_temporal_layers,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Configured, { name: 'publish' })
  async publish(
    @Args('audio') audio: boolean,
    @Args('video') video: boolean,
    @Args('data') data: boolean,
    @Args('jsep', { type: () => JsepInput, nullable: true }) jsep: JsepInput,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.publish({
      feed: user.id, 
      audio, 
      video, 
      data, 
      jsep
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Configured, { name: 'configure' })
  async configure(
    @Args('room', { type: () => Int }) room: number,
    @Args('audio', { type: () => Boolean }) audio: boolean,
    @Args('video', { type: () => Boolean }) video: boolean,
    @Args('data', { type: () => Boolean }) data: boolean,
    @Args('jsep', { type: () => JsepInput, nullable: true }) jsep: JsepInput,
    @Args('restart', { type: () => Boolean, nullable: true }) restart: boolean,
    @Args('sc_substream_layer', { type: () => Int, nullable: true }) sc_substream_layer: number,
    @Args('sc_temporal_layers', { type: () => Int, nullable: true }) sc_temporal_layers: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.configure({
      feed: user.id,
      room,
      audio,
      video,
      data,
      jsep,
      restart,
      sc_substream_layer,
      sc_temporal_layers,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Unpublished, { name: 'unpublish' })
  async unpublish(
    @CurrentUser() user: UserEntity,
  ) {
    return this.janusService.unpublish({
      feed: user.id,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Leaving, { name: 'leave', nullable: true })
  async leave(
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.leave({
      feed: user.id,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Started, { name: 'start' })
  async start(
    @Args('feed', { type: () => Int }) feed: number,
    @Args('jsep', { type: () => JsepInput, nullable: true }) jsep: JsepInput,
    @CurrentUser() user: UserEntity,
  ) {
    return this.janusService.start({
      feed,
      jsep,
    })
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Paused, { name: 'pause' })
  async pause(
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.pause({
      feed: user.id,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Switched, { name: 'switch' })
  async switch(
    @Args('to_feed', { type: () => Int }) to_feed: number,
    @Args('audio', { type: () => Boolean }) audio: boolean,
    @Args('video', { type: () => Boolean }) video: boolean,
    @Args('data', { type: () => Boolean }) data: boolean,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.switch({
      from_feed: user.id,
      to_feed,
      audio,
      video,
      data,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'trickle' })
  async trickle(
    @Args('feed', { type: () => Int }) feed: number,
    @Args('candidate', { type: () => CandidateInput }) candidate: CandidateInput,
    @CurrentUser() user: UserEntity
  ) {
    console.log('tricke received', feed, candidate);
    return this.janusService.trickle({
      feed,
      candidate,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'trickleComplete' })
  async trickleComplete(    
    @Args('feed', { type: () => Int }) feed: number,
    @Args('candidate', { type: () => CandidateInput, nullable: true }) candidate: CandidateInput,
    @CurrentUser() user: UserEntity
  ) {
    console.log('tricke-complete received', feed, candidate);
    return this.janusService.trickleComplete({
      feed,
      candidate,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean, { name: 'disconnect' })
  async disconnect(
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.disconnect();
  }

  // management API
  @UseGuards(AuthGuard)
  @Mutation(() => ParticipantsList, { name: 'listParticipants' })
  async listParticipants(
    @Args('room', { type: () => Int }) room: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.listParticipants({
      room,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Kicked, { name: 'kick' })
  async kick(
    @Args('feed', { type: () => Int }) feed: number,
    @Args('room', { type: () => Int }) room: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.kick({
      feed,
      room,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Exists, { name: 'exists' })
  async exists(
    @Args('room', { type: () => Int }) room: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.exists({
      room,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => RoomsList, { name: 'listRooms' })
  async listRooms(
    @CurrentUser() user: UserEntity
  ) {
    return this.janusService.listRooms();
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Created, { name: 'create' })
  async create(
    @Args('room', { type: () => Int }) room: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.janusService.create({
      room
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Destroyed, { name: 'destroy' })
  async destroy(
    @Args('room', { type: () => Int }) room: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.janusService.destroy({
      room
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Allowed, { name: 'allow' })
  async allow(
    @Args('room', { type: () => Int }) room: number,
    @Args('action') action: string,
  ) {
    return this.janusService.allow({
      room,
      action,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => RtpFwdStarted, { name: 'rtpFwdStart' })
  async rtpFwdStart(
    @Args('room', { type: () => Int }) room: number,
    @Args('feed', { type: () => Int }) feed: number,
    @Args('host') host: string,
  ) {
    return this.janusService.rtpFwdStart({
      room,
      feed,
      host,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => RtpFwdStopped, { name: 'rtpFwdStop' })
  async rtpFwdStop(
    @Args('room', { type: () => Int }) room: number,
    @Args('feed', { type: () => Int }) feed: number,
    @Args('stream', { type: () => Int }) stream: number,
  ) {
    return this.janusService.rtpFwdStop({
      room,
      feed,
      stream,
    });
  }

  @UseGuards(AuthGuard)
  @Mutation(() => RtpFwdList, { name: 'rtpFwdList' })
  async rtpFwdList(
    @Args('room', { type: () => Int }) room: number,
  ) {
    return this.janusService.rtpFwdList({
      room,
    });
  }

  @Subscription(() => MyError, {
    name: 'error',
    filter: (payload, variables) => payload.feed === variables.feed
  })
  error(
    @Args('feed', { type: () => Int, nullable: true }) feed: number,
  ) {
    console.log('error subscription', feed);
    return this.pubSub.asyncIterator('error');
  }


  @Subscription(() => Destroyed, {
    name: 'destroyed', 
    filter: (payload, variables) => payload.feed === variables.feed
  }) 
  destroyed(
    @Args('feed', { type: () => Int, nullable: true }) feed: number,
  ) {
    console.log('destroyed subscription', feed)
    return this.pubSub.asyncIterator('destroyed');
  }

  @Subscription(() => PubList, {
    name: 'feedList', 
    filter: (payload, variables) => payload.feed === variables.feed
  }) 
  feedList(
    @Args('feed', { type: () => Int, nullable: true }) feed: number,
  ) {
    console.log('feedList subscription', feed)
    return this.pubSub.asyncIterator('feedList');
  }

  @Subscription(() => PubPeerJoined, {
    name: 'feedJoined',
    filter: (payload, variables) => payload.feed === variables.feed
  })
  feedJoined(
    @Args('feed', { type: () => Int, nullable: true }) feed: number,
  ) {
    console.log('feedJoined subscription', feed)
    return this.pubSub.asyncIterator('feedJoined');
  }

  @Subscription(() => Unpublished, {
    name: 'unpublished',
    filter: (payload, variables) => payload.feed === variables.feed
  })
  unpublished(
    @Args('feed', { type: () => Int, nullable: true }) feed: number,
  ) {
    console.log('unpublished subscription', feed)
    return this.pubSub.asyncIterator('unpublished');
  }

  @Subscription(() => Leaving, {
    name: 'leaving',
    filter: (payload, variables) => payload.feed === variables.feed
  })
  leaving(
    @Args('feed', { type: () => Int, nullable: true }) feed: number,
  ) {
    console.log('leaving subscription', feed)
    return this.pubSub.asyncIterator('leaving');
  }

  @Subscription(() => Display, {
    name: 'display',
    filter: (payload, variables) => payload.feed === variables.feed
  })
  display(
    @Args('feed', { type: () => Int, nullable: true }) feed: number,
  ) {
    console.log('display subscription', feed)
    return this.pubSub.asyncIterator('display');
  }

  @Subscription(() => Talking, {
    name: 'talking',
    filter: (payload, variables) => payload.feed === variables.feed
  })
  talking(
    @Args('feed', { type: () => Int, nullable: true }) feed: number,
  ) {
    console.log('talking subscription', feed)
    return this.pubSub.asyncIterator('talking');
  }

  @Subscription(() => Kicked, {
    name: 'kicked',
    filter: (payload, variables) => payload.feed === variables.feed
  })
  kicked(
    @Args('feed', { type: () => Int, nullable: true  }) feed: number,
  ) {
    console.log('kicked subscription', feed)
    return this.pubSub.asyncIterator('kicked');
  }
}
