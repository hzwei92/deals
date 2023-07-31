import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { User } from 'src/users/user.entity';
import { CandidateInput, JsepInput } from './janus.model';
import { PUB_SUB } from 'src/pub-sub/pub-sub.module';

const LOG_NS = '[JanusService]';

@Injectable()
export class JanusService {
  task: any;

  janode: any;
  videoRoomPlugin: any;
  connection: any;
  session: any;
  managerHandle: any;

  handles: any[];

  constructor(
    private readonly configService: ConfigService,
    @Inject(PUB_SUB)
    private readonly pubSub: RedisPubSub,
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

    console.log(`${LOG_NS} schedule connection`)

    this.task = setTimeout(() => {
      this.connectService()
        .then(() => this.task = null)
        .catch(() => {
          this.task = null;
          this.scheduleConnection();
        });
    }, del * 1000);
  }

  async connectService() {
    try {
      const janodeConfig = {
        is_admin: false,
        address: {
          url: this.configService.get('JANUS_URL'),
          apisecret: this.configService.get('JANUS_SECRET'),
        }
      };

      console.log(`${LOG_NS} connecting Janode...`)
      this.connection = await this.janode.connect(janodeConfig);
      console.log(`${LOG_NS} connection with Janus created `);

      this.connection.once(this.janode.EVENT.CONNECTION_CLOSED, () => {
        console.log(`${LOG_NS} connection with Janus closed`);
      });

      this.connection.once(this.janode.EVENT.CONNECTION_ERROR, error => {
        console.error(`${LOG_NS} connection with Janus error: ${error.message}`);
  
        this.pubSub.publish('error', {
          error: error.message,
        });
  
        this.scheduleConnection();
      });
  
      this.session = await this.connection.create();
      console.log(`${LOG_NS} session ${this.session.id} with Janus created`);
  
      this.session.once(this.janode.EVENT.SESSION_DESTROYED, () => {
        console.log(`${LOG_NS} session ${this.session.id} destroyed`);
        this.session = null;
      });
  
      this.managerHandle = await this.session.attach(this.videoRoomPlugin);
      console.log(`${LOG_NS} manager handle ${this.managerHandle.id} attached`);

      this.managerHandle.once(this.janode.EVENT.HANDLE_DETACHED, () => {
        console.log(`${LOG_NS} ${this.managerHandle.name} manager handle detached event`);
      });
    }
    catch (error) {
      console.error(`${LOG_NS} Janode setup error: ${error.message}`);
      if (this.connection) this.connection.close().catch(() => { });
  
      this.pubSub.publish('error', {
        error: error.message,
      });
  
      throw error;
    }

  }


  async join(params: {feed: number, room: number, display: string}) {
    let pubHandle;
    try {
      console.log(`${LOG_NS} [${params.feed}] videoroom join received`);

      if (!this.session) {
        throw new Error('videoroom session not found');
      }

      pubHandle = await this.session.attach(this.videoRoomPlugin);

      console.log(`${LOG_NS} videoroom publisher handle ${pubHandle.id} attached`);
      this.insertHandle(pubHandle);

      // custom vidoeroom publisher/manager events
      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_DESTROYED, event => {
        this.pubSub.publish('destroyed', { 
          destroyed: event,
          feed: params.feed
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_PUB_LIST, event => {
        this.pubSub.publish('feedList', { 
          feedList: event,
          feed: params.feed,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_PUB_PEER_JOINED, event => {
        this.pubSub.publish('feedJoined', {
          feedJoined: event,
          feed: params.feed,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_UNPUBLISHED, event => {
        const handle = this.getHandleByFeed(event.feed);
        this.removeHandleByFeed(event.feed);
        if (handle) handle.detach().catch(() => { });
        this.pubSub.publish('unpublished', {
          unpublished: event,
          feed: params.feed
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_LEAVING, event => {
        const handle = this.getHandleByFeed(event.feed);
        this.removeHandleByFeed(event.feed);
        if (handle) handle.detach().catch(() => { });
        this.pubSub.publish('leaving', {
          leaving: event,
          feed: params.feed,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_DISPLAY, event => {
        this.pubSub.publish('display', {
          display: event,
          feed: params.feed,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_TALKING, event => {
        this.pubSub.publish('talking', {
          talking: event,
          feed: params.feed,
        });
      });

      pubHandle.on(this.videoRoomPlugin.EVENT.VIDEOROOM_KICKED, event => {
        const handle = this.getHandleByFeed(event.feed);
        this.removeHandleByFeed(event.feed);
        if (handle) handle.detach().catch(() => { });
        this.pubSub.publish('kicked', {
          kicked: event,
          feed: params.feed,
        });
      });

      // generic videoroom events
      pubHandle.on(this.janode.EVENT.HANDLE_WEBRTCUP, () => console.log(`${LOG_NS} ${pubHandle.feed} ${pubHandle.name} webrtcup event`));
      pubHandle.on(this.janode.EVENT.HANDLE_MEDIA, event => console.log(`${LOG_NS} ${pubHandle.feed} ${pubHandle.name} media event ${JSON.stringify(event)}`));
      pubHandle.on(this.janode.EVENT.HANDLE_SLOWLINK, event => console.log(`${LOG_NS} ${pubHandle.feed} ${pubHandle.name} slowlink event ${JSON.stringify(event)}`));
      pubHandle.on(this.janode.EVENT.HANDLE_HANGUP, event => console.log(`${LOG_NS} ${pubHandle.feed} ${pubHandle.name} hangup event ${JSON.stringify(event)}`));
      pubHandle.on(this.janode.EVENT.HANDLE_DETACHED, () => {
        console.log(`${LOG_NS} ${pubHandle.feed} ${pubHandle.name} detached event`);
        this.removeHandle(pubHandle);
      });
      pubHandle.on(this.janode.EVENT.HANDLE_TRICKLE, event => console.log(`${LOG_NS} ${pubHandle.feed} ${pubHandle.name} trickle event ${JSON.stringify(event)}`));

      return pubHandle.joinPublisher(params);
    }
    catch (err) {
      if (pubHandle) pubHandle.detach().catch(() => { });
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async subscribe(params: {feed: number, room: number, audio: boolean, video: boolean, data: boolean, sc_substream_layer: number, sc_temporal_layers: number}) {
    let subHandle;
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      subHandle = await this.session.attach(this.videoRoomPlugin);
      console.log(`${LOG_NS} videoroom listener handle ${subHandle.id} attached`);
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

      return subHandle.joinSubscriber(params);
    } 
    catch (err) {
      if (subHandle) subHandle.detach().catch(() => { });
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }
  
  async publish(params: { feed: number, audio: boolean, video: boolean, data: boolean, jsep: JsepInput }) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      const handle = this.getHandleByFeed(params.feed);
      if (!handle) {
        throw new Error('videoroom publish handle not found');
      }
      return handle.publish(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async configure(params: { 
    feed: number, 
    room: number, 
    audio: boolean, 
    video: boolean, 
    data: boolean, 
    jsep: JsepInput, 
    restart: boolean, 
    sc_substream_layer: number, 
    sc_temporal_layers: number,
  }) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      const handle = this.getHandleByFeed(params.feed);
      if (!handle) {
        throw new Error('videoroom configure handle not found');
      }
      const response = await handle.configure(params);
      delete response.configured;
      return response;
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async unpublish(params: { feed: number }) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      const handle = this.getHandleByFeed(params.feed);
      if (!handle) {
        throw new Error('videoroom configure handle not found');
      }
      return handle.unpublish();
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async leave(params: { feed: number }) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      const handle = this.getHandleByFeed(params.feed);
      if (!handle) {
        throw new Error('videoroom leave handle not found');
      }
      const res = await handle.leave();
      handle.detach().catch(() => { });
      return res;
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async start(params: {feed: number, jsep: JsepInput}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      const handle = this.getHandleByFeed(params.feed);
      console.log('start handle', handle)
      if (!handle) {
        throw new Error('videoroom start handle not found');
      }
      return handle.start(params);
    }
    catch (err) {
      console.log('error', err, params)
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async pause(params: {feed: number}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      const handle = this.getHandleByFeed(params.feed);
      if (!handle) {
        throw new Error('videoroom pause handle not found');
      }
      return handle.pause();
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async switch(params: {from_feed: number, to_feed: number, audio: boolean, video: boolean, data: boolean}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      const handle = this.getHandleByFeed(params.from_feed);
      if (!handle) {
        throw new Error('videoroom switch handle not found');
      }
      delete params.from_feed;
      return handle.switch(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async trickle(params: {feed: number, candidate: CandidateInput}) {
    if (!this.session) {
      throw new Error('videoroom session not found');
    }
    const handle = this.getHandleByFeed(params.feed);
    if (!handle) {
      throw new Error('videoroom trickle handle not found');
    }
    try {
      handle.trickle(params.candidate);
      return true;
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async trickleComplete(params: {feed: number, candidate: CandidateInput}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      const handle = this.getHandleByFeed(params.feed);
      if (!handle) {
        throw new Error('videoroom trickle-complete handle not found');
      }
      handle.trickleComplete(params.candidate);
      return true;
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async disconnect() {
    this.leaveAll();
    this.detachAll();
    return true;
  }

  // Management API

  async listParticipants(params: {room: number}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found')
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found')
      }
      return this.managerHandle.list_participants(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async kick(params: {feed: number, room: number }) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found')
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found')
      }
      return this.managerHandle.kick(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async exists(params: {room: number}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found')
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found')
      }
      return this.managerHandle.exists(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async listRooms() {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found')
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found')
      }
      return this.managerHandle.list();
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: '',
        }
      });
    }
  }

  async create(params: {room: number}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found');
      }
      return this.managerHandle.create(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async destroy(params: { room: number }) {
    if (!this.session) {
      throw new Error('videoroom session not found');
    }
    if (!this.managerHandle) {
      throw new Error('videoroom manager handle not found');
    }
    try {
      return this.managerHandle.destroy(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async allow(params: { room: number, action: string }) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found');
      }
      return this.managerHandle.allow(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async rtpFwdStart(params: {feed: number, room: number, host: string}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found');
      }
      return this.managerHandle.startForward(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async rtpFwdStop(params: {room: number, feed: number, stream: number}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found');
      }
      return this.managerHandle.stopForward(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
  }

  async rtpFwdList(params: {room: number}) {
    try {
      if (!this.session) {
        throw new Error('videoroom session not found');
      }
      if (!this.managerHandle) {
        throw new Error('videoroom manager handle not found');
      }
      return this.managerHandle.listForward(params);
    }
    catch (err) {
      this.pubSub.publish('error', {
        error: {
          error: err.message,
          request: JSON.stringify(params),
        }
      });
    }
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
