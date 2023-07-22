import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';

const LOG_NS = '[JanusService]';

@Injectable()
export class JanusService {
  task: any;

  janode: any;
  videoRoomPlugin: any;
  connection: any;
  session: any;
  handle: any;

  handles: any[];

  constructor(
    private readonly configService: ConfigService,
  ) {
    (async () => {
      const { default: Janode } = await eval("import('janode')");
      const { default: VideoRoomPlugin } = await eval("import('janode/plugins/videoroom')");
      this.janode = Janode;
      this.videoRoomPlugin = VideoRoomPlugin;
  
      this.handles = [];

      this.scheduleConnection(1);
    })();
  }

  scheduleConnection(del = 10) {
    if (this.task) return;

    console.log(`${LOG_NS} scheduleConnection`)

    this.task = setTimeout(() => {
      this.init()
        .then(() => this.task = null)
        .catch(() => {
          this.task = null;
          this.scheduleConnection();
        });
    }, del * 1000);
  }

  async init() {
    console.log(`${LOG_NS} init`)
    try {
      this.connection = await this.janode.connect({
        is_admin: false,
        address: {
          url: this.configService.get('JANUS_URL'),
          apisecret: this.configService.get('JANUS_SECRET'),
        }
      });
      console.log(`${LOG_NS} connected: `)

      this.connection.once(this.janode.EVENT.CONNECTION_ERROR, error => {
        console.error(`${LOG_NS} connection with Janus error: ${error.message}`);
  
        //replyError(io, 'backend-failure');
  
        this.scheduleConnection();
      });
  
      this.session = await this.connection.create();
      console.log(`${LOG_NS} session ${this.session.id} with Janus created`);
  
      this.session.once(this.janode.EVENT.SESSION_DESTROYED, () => {
        console.log(`${LOG_NS} session ${this.session.id} destroyed`);
        this.session = null;
      });
  
      this.handle = await this.session.attach(this.videoRoomPlugin);
      console.log(`${LOG_NS} manager handle ${this.handle.id} attached`);

      // generic handle events
      this.handle.once(this.janode.EVENT.HANDLE_DETACHED, () => {
        console.log(`${LOG_NS} ${this.handle.name} manager handle detached event`);
      });
    }
    catch (error) {
      console.error(`${LOG_NS} Janode setup error: ${error.message}`);
      if (this.connection) this.connection.close().catch(() => { });
  
      // notify clients
      //replyError(io, 'backend-failure');
  
      throw error;
    }

  }


  async join(userId: number, channelId: number, joinData: any, pubSub: RedisPubSub) {
    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }

    let pubHandle;

    try {
      pubHandle = await this.session.attach(this.videoRoomPlugin);

      console.log(`${LOG_NS} ${userId}:${channelId} videoroom publisher handle ${pubHandle.id} attached`);
      this.insertHandle(pubHandle);

      // custom vidoeroom publisher/manager events
      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_DESTROYED, event => {
        pubSub.publish('destroyed', { 
          destroyed: event,
          userId,
          channelId,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_PUB_LIST, event => {
        pubSub.publish('feedList', { 
          feedList: event,
          userId,
          channelId,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_PUB_PEER_JOINED, event => {
        pubSub.publish('feedJoined', {
          feedJoined: event,
          userId,
          channelId,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_UNPUBLISHED, event => {
        const handle = this.getHandleByFeed(event.feed);
        this.removeHandleByFeed(event.feed);
        if (handle) handle.detach().catch(() => { });
        pubSub.publish('unpublished', {
          unpublished: event,
          userId,
          channelId,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_LEAVING, event => {
        const handle = this.getHandleByFeed(event.feed);
        this.removeHandleByFeed(event.feed);
        if (handle) handle.detach().catch(() => { });
        pubSub.publish('leaving', {
          leaving: event,
          userId,
          channelId,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_DISPLAY, event => {
        pubSub.publish('display', {
          display: event,
          userId,
          channelId,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_TALKING, event => {
        pubSub.publish('talking', {
          talking: event,
          userId,
          channelId,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_KICKED, event => {
        const handle = this.getHandleByFeed(event.feed);
        this.removeHandleByFeed(event.feed);
        if (handle) handle.detach().catch(() => { });
        pubSub.publish('kicked', {
          kicked: event,
          userId,
          channelId,
        });
      });

      // generic videoroom events
      pubHandle.on(this.janode.EVENT.HANDLE_WEBRTCUP, () => console.log(`${LOG_NS} ${pubHandle.name} webrtcup event`));
      pubHandle.on(this.janode.EVENT.HANDLE_MEDIA, event => console.log(`${LOG_NS} ${pubHandle.name} media event ${JSON.stringify(event)}`));
      pubHandle.on(this.janode.EVENT.HANDLE_SLOWLINK, event => console.log(`${LOG_NS} ${pubHandle.name} slowlink event ${JSON.stringify(event)}`));
      pubHandle.on(this.janode.EVENT.HANDLE_HANGUP, event => console.log(`${LOG_NS} ${pubHandle.name} hangup event ${JSON.stringify(event)}`));
      pubHandle.on(this.janode.EVENT.HANDLE_DETACHED, () => {
        console.log(`${LOG_NS} ${pubHandle.name} detached event`);
        this.removeHandle(pubHandle);
      });
      pubHandle.on(this.janode.EVENT.HANDLE_TRICKLE, event => console.log(`${LOG_NS} ${pubHandle.name} trickle event ${JSON.stringify(event)}`));

      const response = await pubHandle.joinPublisher(joinData);

      pubSub.publish('joined', {
        joined: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} joined sent`);
      return true;
    }
    catch (err) {
      if (pubHandle) pubHandle.detach().catch(() => { });
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom publisher handle attach error: ${err.message}`);
      throw err;
    }
  }

  async subscribe(userId: number, channelId: number, subscribeData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} subscribe received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }

    let subHandle;

    try {
      subHandle = await this.session.attach(this.videoRoomPlugin);
      console.log(`${LOG_NS} ${userId}:${channelId} videoroom listener handle ${subHandle.id} attached`);
      this.insertHandle(subHandle);

      // generic videoroom events
      subHandle.on(this.janode.EVENT.HANDLE_WEBRTCUP, () => console.log(`${LOG_NS} ${subHandle.name} webrtcup event`));
      subHandle.on(this.janode.EVENT.HANDLE_SLOWLINK, event => console.log(`${LOG_NS} ${subHandle.name} slowlink event ${JSON.stringify(event)}`));
      subHandle.on(this.janode.EVENT.HANDLE_HANGUP, event => console.log(`${LOG_NS} ${subHandle.name} hangup event ${JSON.stringify(event)}`));
      subHandle.once(this.janode.EVENT.HANDLE_DETACHED, () => {
        console.log(`${LOG_NS} ${subHandle.name} detached event`);
        this.removeHandle(subHandle);
      });
      subHandle.on(this.janode.EVENT.HANDLE_TRICKLE, event => console.log(`${LOG_NS} ${subHandle.name} trickle event ${JSON.stringify(event)}`));


      // specific videoroom events
      subHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_SC_SUBSTREAM_LAYER, event => console.log(`${LOG_NS} ${subHandle.name} simulcast substream layer switched to ${event.sc_substream_layer}`));
      subHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_SC_TEMPORAL_LAYERS, event => console.log(`${LOG_NS} ${subHandle.name} simulcast temporal layers switched to ${event.sc_temporal_layers}`));

      const response = await subHandle.joinListener(subscribeData);

      console.log('response', response)
      pubSub.publish('subscribed', {
        subscribed: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} subscribed sent`);
      return true;
    } catch (err) {
      if (subHandle) subHandle.detach().catch(() => { });
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom subscribe handle attach error: ${err.message}`);
      throw err;
    }
  }
  
  async publish(userId: number, channelId: number, publishData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} publish received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }

    const handle = this.getHandleByFeed(publishData.feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom publish handle not found`);
      throw new Error('videoroom publish handle not found');
    }

    try {
      const response = await handle.publish(publishData);
      pubSub.publish('published', {
        published: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} published sent`);
      return true;
    } catch (err) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom publish error: ${err.message}`);
      throw err;
    }
  }

  async configure(userId: number, channelId: number, configureData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} configure received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(configureData.feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom configure handle not found`);
      throw new Error('videoroom configure handle not found');
    }
    try {
      const response = await handle.configure(configureData);
      delete response.configured;
      pubSub.publish('configured', {
        configured: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} configured sent`);
      return true;
    } catch (err) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom configure error: ${err.message}`);
      throw err;
    }
  }

  async unpublish(userId: number, channelId: number, unpublishData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} unpublish received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(unpublishData.feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom configure handle not found`);
      throw new Error('videoroom configure handle not found');
    }
    try {
      const response = await handle.unpublish();
      pubSub.publish('unpublished', {
        unpublished: response,
        userId,
        channelId,
      });

      console.log(`${LOG_NS} ${userId}:${channelId} unpublished sent`);
      return true;
    } catch (err) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom unpublish error: ${err.message}`);
      throw err;
    }
  }

  async leave(userId: number, channelId: number, leaveData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} leave received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(leaveData.feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom leave handle not found`);
      throw new Error('videoroom leave handle not found');
    }

    try {
      const response = await handle.leave();
      pubSub.publish('leaving', {
        leaving: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} leaving sent`);
      handle.detach().catch(() => { });
      return true;
    } catch (err) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom leave error: ${err.message}`);
      throw err;
    }
  }

  async start(userId: number, channelId: number, startData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} start received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(startData.feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom start handle not found`);
      throw new Error('videoroom start handle not found');
    }
    try {
      const response = await handle.start(startData);
      pubSub.publish('started', {
        started: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} started sent`);
      return true;
    } catch (err) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom start error: ${err.message}`);
      throw err;
    }
  }

  async pause(userId: number, channelId: number, pauseData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} pause received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(pauseData.feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom pause handle not found`);
      throw new Error('videoroom pause handle not found');
    }

    try {
      const response = await handle.pause();
      pubSub.publish('paused', {
        paused: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} paused sent`);
      return true;
    } catch (err) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom pause error: ${err.message}`);
      throw err;
    }
  }

  async switch(userId: number, channelId: number, switchData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} switch received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(switchData.from_feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom switch handle not found`);
      throw new Error('videoroom switch handle not found');
    }

    try {
      const response = await handle.switch({
        to_feed: switchData.to_feed,
        audio: switchData.audio,
        video: switchData.video,
        data: switchData.data,
      });
      pubSub.publish('switched', {
        paused: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} switched sent`);
      return true;
    } catch (err) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom switch error: ${err.message}`);
      throw err;
    }
  }

  async trickle(userId: number, channelId: number, trickleData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} trickle received`);
    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(trickleData.feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom trickle handle not found`);
      throw new Error('videoroom trickle handle not found');
    }
    handle.trickle(trickleData.candidate).catch((err) => {
      console.error(`${LOG_NS} ${userId}:${channelId} trickle error: ${err.message}`);
      throw err;
    });
    return true;
  }

  async trickleComplete(userId: number, channelId: number, trickleData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} trickle-complete received`);
    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(trickleData.feed);
    if (!handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom trickle-complete handle not found`);
      throw new Error('videoroom trickle-complete handle not found');
    }
    handle.trickleComplete(trickleData.candidate).catch((err) => {
      console.error(`${LOG_NS} ${userId}:${channelId} trickle error: ${err.message}`);
      throw err;
    });
    return true;
  }

  async create(userId: number, channelId: number, createData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} create received`);

    if (!this.session) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom session not found`);
      throw new Error('videoroom session not found');
    }
    if (!this.handle) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom manager handle not found`);
      throw new Error('videoroom manager handle not found');
    }

    try {
      const response = await this.handle.create({
        ...createData,
        room: channelId,
      });
      pubSub.publish('created', {
        created: response,
        userId,
        channelId,
      });
      console.log(`${LOG_NS} ${userId}:${channelId} created sent`);
      return true;
    } catch (err) {
      console.error(`${LOG_NS} ${userId}:${channelId} videoroom create error: ${err.message}`);
      throw err;
    }
  }

  async disconnect(userId: number, channelId: number, trickleData: any, pubSub: RedisPubSub) {
    console.log(`${LOG_NS} ${userId}:${channelId} disconnected socket`);

    await this.leaveAll();
    await this.detachAll();
  }

  insertHandle(handle) {
    this.handles.push(handle);
  }
  getHandleByFeed(feed) {
    return this.handles.find(h => h.feed === feed);
  }
  removeHandle(handle) {
    this.handles = this.handles.filter(h => h.id !== handle.id);
  }
  removeHandleByFeed(feed) {
    this.handles = this.handles.filter(h => h.feed !== feed);
  }
  leaveAll() {
    const leaves = this.handles.map(h => h.leave().catch(() => { }));
    return Promise.all(leaves);
  }
  detachAll() {
    const detaches = this.handles.map(h => h.detach().catch(() => { }));
    this.handles = [];
    return Promise.all(detaches);
  }
}
