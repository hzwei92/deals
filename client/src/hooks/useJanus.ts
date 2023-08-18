
import Janus from 'janus-gateway/npm';
import { JanusJS } from 'janus-gateway/npm';
import { useEffect, useState } from 'react';

import adapter from 'webrtc-adapter';

let janus = null as Janus | null;
let sfutest = null as JanusJS.PluginHandle | null;
let opaqueId = "videoroomtest-" + Janus.randomString(12);

let myroom = 1234;
let myusername = null as any;
let myid = null as any;
let mystream = null as any;
let mypvtid = null as any;

let remoteFeed = null as JanusJS.PluginHandle | null;
let feeds = {} as any;
let feedStreams = {} as any;
let subStreams = {} as any, slots = {} as any, mids = {} as any, subscriptions = {} as any;
let localTracks = {} as Record<string, MediaStream>;
let localVideos = 0;
let remoteTracks = {} as Record<string, MediaStream>;
let bitrateTimer = [] as any[], simulcastStarted = {} as any, svcStarted = {} as any;

let doSimulcast = false;
let doSvc = null as boolean | null;
let acodec = null as string | null;
let vcodec = "h264" as string | null;
let subscriber_mode = false;
let use_msid = false;

let creatingSubscription = false;

const useJanus = () => {
  const [refresh, setRefresh] = useState(false);
  
  useEffect(() => {
    Janus.init({
      debug: true,
      dependencies: Janus.useDefaultDependencies({ adapter }),
      callback: () => {
        Janus.log('Janus initialized');
      }
    })
    janus = new Janus({
      server: import.meta.env.VITE_JANUS_URL,
      apisecret: import.meta.env.VITE_JANUS_SECRET,
      success: () => {
        Janus.log('Janus session connected');
      },
      error: (err) => {
        Janus.error(err);
      },
      destroyed: () => {
        setRefresh(prev => !prev);
        console.log('Janus session destroyed');
      },
    });

    return () => {
      janus?.destroy({});
    }
  }, []);

const joinRoom = (room: number, id: number, username: string) => {
  myroom = room;
  myid = id;
  myusername = username;

  let register = {
    request: "join",
    id: myid,
    room: myroom,
    ptype: "publisher",
    display: myusername,
  };

  let exists = {
    request: "exists",
    room: myroom,
  };

  const registerRoom = () => {
    sfutest?.send({
      message: exists,
      success: (res) => {
        Janus.log("Exists", res);
        if (res.exists) {
          sfutest?.send({
            message: register,
            success: (res) => {
              Janus.log("Register success", res);
            }
          })
        }
        else {
          let create = {
            request: "create",
            room: myroom,
          } as any;
          if (vcodec === 'h264') {
            create['videocodec'] = vcodec;
            create['h264_profile'] = '42e01f'
          }
          sfutest?.send({ 
            message: create,
            success: (res) => {
              Janus.log("Create success", res);
              sfutest?.send({
                message: register,
                success: (res) => {
                  Janus.log("Register success", res);
                }
              })
            }
          })
        }
      },
      error: (err) => {
        Janus.error("Exists error", err);
      },
    });
  }

  if (!sfutest) {
    janus?.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: 'videoroomtest',
      success: (pluginHandle) => {
        setRefresh(prev => !prev);
        sfutest = pluginHandle;
        Janus.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
        Janus.log("  -- This is a publisher/manager");
        registerRoom();
      },
      error: (err) => {
        Janus.error('Janus plugin error', err);
      },
      consentDialog: (on) => {
        Janus.debug('Consent dialog should be ' + (on ? 'on' : 'off') + ' now');
      },
      iceState: (state) => {
        Janus.log('ICE state changed to', state);
      },
      mediaState: (medium, on, mid) => {
        Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium + " (mid=" + mid + ")");
      },
      webrtcState: (on) => {
        Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
      },
      slowLink: (uplink, lost, mid) => {
        Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") +
          " packets on mid " + mid + " (" + lost + " lost packets)");
      },
      onmessage: (msg, jsep) => {
        setRefresh(prev => !prev);
        Janus.debug(" ::: Got a message (publisher) :::", msg);
        let event = msg["videoroom"];
        Janus.debug("Event: " + event);
        if (event != undefined && event != null) {
          if (event === "joined") {
            // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
            myid = msg["id"];
            mypvtid = msg["private_id"];
            Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);
            if (subscriber_mode) {
  
            }
            else {
              publishOwnFeed(true);
            }
            // Any new feed to attach to?
            if (msg["publishers"]) {
              let list = msg["publishers"];
              Janus.debug("Got a list of available publishers/feeds:", list);
              let sources = null;
              for (let f in list) {
                if (list[f]["dummy"]) 
                  continue;
                let id = list[f]["id"];
                let display = list[f]["display"];
                let streams = list[f]["streams"];
                for (let i in streams) {
                  let stream = streams[i];
                  stream["id"] = id;
                  stream["display"] = display;
                }
                let slot = feedStreams[id] ? feedStreams[id]?.slot : null;
                let remoteVideos = feedStreams[id] ? feedStreams[id]?.remoteVideos : 0;
                feedStreams[id] = {
                  id: id,
                  display: display,
                  streams: streams,
                  slot: slot,
                  remoteVideos: remoteVideos
                }
                Janus.debug("  >> [" + id + "] " + display + ":", streams);
                if(!sources) {
                  sources = [];
                }
                sources.push(streams);
              }
              if (sources) {
                subscribeTo(sources);
              }
            }
          }
          else if (event === "destroyed") {
            // The room has been destroyed
            Janus.warn("The room has been destroyed!");
          }
          else if (event === "event") {
            // Any info on our streams or a new feed to attach to?
            if (msg["streams"]) {
              let streams = msg["streams"];
              for(let i in streams) {
                let stream = streams[i];
                stream["id"] = myid;
                stream["display"] = myusername;
              }
              feedStreams[myid] = {
                id: myid,
                display: myusername,
                streams: streams
              }
            }
            else if (msg["publishers"]) {
              let list = msg["publishers"];
              Janus.debug("Got a list of available publishers/feeds:", list);
              let sources = null;
              for(let f in list) {
                if(list[f]["dummy"])
                  continue;
                let id = list[f]["id"];
                let display = list[f]["display"];
                let streams = list[f]["streams"];
                for(let i in streams) {
                  let stream = streams[i];
                  stream["id"] = id;
                  stream["display"] = display;
                }
                let slot = feedStreams[id] ? feedStreams[id].slot : null;
                let remoteVideos = feedStreams[id] ? feedStreams[id].remoteVideos : 0;
                feedStreams[id] = {
                  id: id,
                  display: display,
                  streams: streams,
                  slot: slot,
                  remoteVideos: remoteVideos
                }
                Janus.debug("  >> [" + id + "] " + display + ":", streams);
                if(!sources) {
                  sources = [];
                }
                sources.push(streams);
              }
              if(sources) {
                subscribeTo(sources);
              }
            }
            else if (msg["leaving"]) {
              // One of the publishers has gone away?
              let leaving = msg["leaving"];
              Janus.log("Publisher left: " + leaving);
              unsubscribeFrom(leaving);
            }
            else if (msg["unpublished"]) {
              // One of the publishers has unpublished?
              let unpublished = msg["unpublished"];
              Janus.log("Publisher left: " + unpublished);
              if(unpublished === 'ok') {
                // That's us
                sfutest?.hangup();
                sfutest = null;
                return;
              }
              unsubscribeFrom(unpublished);
            }
            else if (msg["error"]) {
              if (msg["error_code"] === 426) {
                // This is a "no such room" error: give a more meaningful description
                console.warn("No such room exists");
              }
              else {
                console.error(msg["error"]);
              }
            }
          }
        }
        if (jsep) {
          Janus.debug("Handling SDP as well...", jsep);
          sfutest?.handleRemoteJsep({ jsep: jsep });
          let audio = msg["audio_codec"];
          if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
            // Audio has been rejected
            console.warn("Our audio stream has been rejected, viewers won't hear us");
          }
          let video = msg["video_codec"];
          if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
            // Video has been rejected
            console.warn("Our video stream has been rejected, viewers won't see us");
          }
        }
      },
      onlocaltrack: (track, on) => {
        setRefresh(prev => !prev);
        Janus.debug(" ::: Got a local track event :::");
        Janus.debug("Local track " + (on ? "added" : "removed") + ":", track);
        let trackId = track.id;
        if (!on) {
          // Track removed, get rid of the stream
          let stream = localTracks[trackId];
          if (stream) {
            try {
              let tracks = stream.getTracks();
              for (let i in tracks) {
                let mst = tracks[i];
                if (mst) {
                  mst.stop();
                }
              }
            }
            catch (err){
              console.warn(err);
            }
          }
          if (track.kind === 'video') {
            localVideos--;
          }
          delete localTracks[trackId];
          return;
        }
        // If we're here, a new track was added
        let stream = localTracks[trackId];
        if (stream) {
          // We've been here before
          return;
        }
        if (track.kind === "audio") {
          // We ignore local audio tracks
          if (localVideos === 0) {
            // No video, TODO show a placeholder
          }
        }
        else {
          // New video track: create a stream out of it
          localVideos++;
          let stream = new MediaStream([track]);
          localTracks[trackId] = stream;
          Janus.log("Created local video stream:", stream);
          Janus.log(stream.getTracks());
          Janus.log(stream.getVideoTracks());
        }
        if (sfutest?.webrtcStuff.pc.iceConnectionState !== "completed" &&
          sfutest?.webrtcStuff.pc.iceConnectionState !== "connected") {
            console.log('Publishing...');
        }
      },
      onremotetrack: (track, mid, on) => {
        // The publisher stream is sendonly, we dont expect anything here
      },
      oncleanup: () => {
        setRefresh(prev => !prev);
        Janus.log(" ::: Got a cleanup notification; we are unpublished now :::");
        mystream = null;
        delete feedStreams[myid];
        localTracks = {};
        localVideos = 0;
      },
    });  
  }
  else {
    registerRoom();
  }
}

const publishOwnFeed = (useAudio: boolean) => {
	// Publish our stream

	// We want sendonly audio and video (uncomment the data track
	// too if you want to publish via datachannels as well)
	let tracks: JanusJS.TrackOption[] = [];
	if (useAudio) {
		tracks.push({ type: 'audio', capture: true, recv: false });
  }
	tracks.push({ type: 'video', capture: true, recv: false,
		// We may need to enable simulcast or SVC on the video track
		simulcast: doSimulcast,
		// We only support SVC for VP9 and (still WIP) AV1
		svc: ((vcodec === 'vp9' || vcodec === 'av1') && doSvc) ? 'true' : undefined,
	});
	//~ tracks.push({ type: 'data' });

	sfutest?.createOffer({
    tracks: tracks,
    success: (jsep) => {
      Janus.debug("Got publisher SDP!");
      Janus.debug(jsep);
      let publish = { request: "configure", audio: useAudio, video: true } as any;
      // You can force a specific codec to use when publishing by using the
      // audiocodec and videocodec properties, for instance:
      // 		publish["audiocodec"] = "opus"
      // to force Opus as the audio codec to use, or:
      // 		publish["videocodec"] = "vp9"
      // to force VP9 as the videocodec to use. In both case, though, forcing
      // a codec will only work if: (1) the codec is actually in the SDP (and
      // so the browser supports it), and (2) the codec is in the list of
      // allowed codecs in a room. With respect to the point (2) above,
      // refer to the text in janus.plugin.videoroom.cfg for more details
      if(acodec) {
        publish["audiocodec"] = acodec;
      }
      if(vcodec) {
        publish["videocodec"] = vcodec;
      }
      sfutest?.send({ message: publish, jsep: jsep });
    },
    error: function(error) {
      Janus.error("WebRTC error:", error);
      if (useAudio) {
        publishOwnFeed(false);
      } else {
        console.warn("WebRTC error... " + error.message);
      }
    }
  });
}

function toggleMute() {
	let muted = sfutest?.isAudioMuted();
	Janus.log((muted ? "Unmuting" : "Muting") + " local stream...");
	if(muted) {
		sfutest?.unmuteAudio();
  }
	else {
		sfutest?.muteAudio();
  }
}

const unpublishOwnFeed = () => {
  // Unpublish our stream
  let unpublish = { request: "unpublish" };
  sfutest?.send({ message: unpublish });
}

const subscribeTo = (sources: any) => {
  // Check if we're still creating the subscription handle
  if (creatingSubscription) {
    setTimeout(() => {
      subscribeTo(sources);
    }, 500);
    return;
  }
  // If we already have a working subscription handle, just update that one
  if (remoteFeed) {
    // Prepare the streams to subscribe to, as an array: we have the list of
    // streams the feeds are publishing, so we can choose what to pick or skip
    let added = null, removed = null;
    for (let s in sources) {
      let streams = sources[s];
      for (let i in streams) {
        let stream = streams[i];
        // If the publisher is VP8/VP9 and this is an older Safari, let's avoid videp
        if (
          stream.type === "video" && 
          Janus.webRTCAdapter.browserDetails.browser === "safari" &&
          (stream.codec === "vp8" && Janus.safariVp8)
        ) {
          console.warn('Publisher is using VP8 and Safari does not support it, disabling video');
          continue;
        }
        if (stream.disabled) {
          Janus.log("Disabled stream:", stream);
          // Unsubscribe
          if (!removed) {
            removed = [];
          }
          removed.push({
            feed: stream.id,
            mid: stream
          });
          delete subscriptions[stream.id][stream.mid];
          continue;
        }
        if (subscriptions[stream.id] && subscriptions[stream.id][stream.mid]) {
          Janus.log("Already subscribed to stream:", stream);
          continue;
        }
        // Find an empty slot in the UI for each new source
        if (!feedStreams[stream.id].slot) {
          let slot;
          for (let i = 1; i <= 6; i++) {
            if (!feeds[i]) {
              slot = i;
              feeds[slot] = stream.id;
              feedStreams[stream.id].slot = slot;
              feedStreams[stream.id].remoteVideos = 0;
              break;
            }
          }
        }
        // Subscribe
        if (!added) {
          added = [];
        }
        added.push({
          feed: stream.id,
          mid: stream.mid,
        });
        if (!subscriptions[stream.id]) {
          subscriptions[stream.id] = {};
        }
        subscriptions[stream.id][stream.mid] = true;
      }
    }
    if ((!added || added.length === 0) && (!removed || removed.length === 0)) {
      // Nothing to do
      return;
    }
    let update = { request: 'update' } as any;
    if (added) {
      update.subscribe = added;
    }
    if (removed) {
      update.unsubscribe = removed;
    }
    remoteFeed.send({ message: update });
    return;
  }
  // If we got here, we're creating a new handle for the subscriptions (we only need one)
  creatingSubscription = true;
  janus?.attach({
    plugin: 'janus.plugin.videoroom',
    opaqueId: opaqueId,
    success: (pluginHandle) => {
      remoteFeed = pluginHandle;
      remoteTracks = {};
      Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
      Janus.log("  -- This is a multistream subscriber");
      // Prepare the streams to subscribe to, as an array:  we hav e the list of
      // streams the feed is publishing, so we can choose what to pick or skip
      let subscription = [];
      for (let s in sources) {
        let streams = sources[s];
        for (let i in streams) {
          let stream = streams[i];
          // If the publisher is VP8/VP9 and this is an older Safari, let's avoid video
          if (
            stream.type === "video" && 
            Janus.webRTCAdapter.browserDetails.browser === "safari" && 
            (stream.codec === "vp8" && Janus.safariVp8)
          ) {
            console.warn('Publisher is using VP8 and Safari does not support it, disabling video');
            continue;
          }
          if (stream.disabled) {
            Janus.log("Disabled stream:", stream);
            // TODO Skipping for now, we should unsubscribe
            continue;
          }
          Janus.log("Subscribed to " + stream.id + "/" + stream.mid + "?", subscriptions);
          if (subscriptions[stream.id] && subscriptions[stream.id][stream.mid]) {
            Janus.log("Already subscribed to stream, skipping: ", stream);
            continue;
          }
          // Find an empty slot in the UI for each new source
          if (!feedStreams[stream.id].slot) {
            let slot;
            for (let i=1; i<=6; i++) {
              if (!feeds[i]) {
                slot = i;
                feeds[slot] = stream.id;
                feedStreams[stream.id].slot = slot;
                feedStreams[stream.id].remoteVideos = 0;
                break;
              }
            }
          }
          subscription.push({
            feed: stream.id,
            mid: stream.mid,
          });
          if (!subscriptions[stream.id]) {
            subscriptions[stream.id] = {};
          }
          subscriptions[stream.id][stream.mid] = true;
        }
      }
      // We wait for the plugin to send us an offer
      let subscribe = {
        request: 'join',
        room: myroom,
        ptype: 'subscriber',
        streams: subscription,
        use_msid: use_msid,
        private_id: mypvtid,
      };
      remoteFeed.send({ message: subscribe });
    },
    error: (err) => {
      Janus.error("  -- Error attaching plugin...", err);
    },
    iceState: (state) => {
      Janus.log("ICE state (remote feed) changed to " + state);
    },
    webrtcState: (on) => {
      Janus.log("Janus says this WebRTC PeerConnection (remote feed) is " + (on ? "up" : "down") + " now");
    },
    slowLink: (uplink, lost, mid) => {
      Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") +
        " packets on mid " + mid + " (" + lost + " lost packets)");
    },
    onmessage: (msg, jsep) => {
      setRefresh(prev => !prev);
      Janus.debug(" ::: Got a message (subscriber) :::", msg);
      let event = msg["videoroom"];
      Janus.debug("Event: " + event);
      if(msg["error"]) {
        console.warn(msg["error"]);
      } else if(event) {
        if(event === "attached") {
          // Now we have a working subscription, next requests will update this one
          creatingSubscription = false;
          Janus.log("Successfully attached to feed in room " + msg["room"]);
        } else if(event === "event") {
          // Check if we got an event on a simulcast-related event from this publisher
          let mid = msg["mid"];
          let substream = msg["substream"];
          let temporal = msg["temporal"];
          if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
            // Check which this feed this refers to
            let slot = slots[mid];
            if(!simulcastStarted[slot]) {
              simulcastStarted[slot] = true;
              // TODO  Add some new buttons
            }
            // TODO We just received notice that there's been a switch, update the buttons
          }
          // Or maybe SVC?
          let spatial = msg["spatial_layer"];
          temporal = msg["temporal_layer"];
          if((spatial !== null && spatial !== undefined) || (temporal !== null && temporal !== undefined)) {
            let slot = slots[mid];
            if(!svcStarted[slot]) {
              svcStarted[slot] = true;
              // Add some new buttons
            }
            // We just received notice that there's been a switch, update the buttons
          }
        } else {
          // What has just happened?
        }
      }
      if(msg["streams"]) {
        // Update map of subscriptions by mid
        for(let i in msg["streams"]) {
          let mid = msg["streams"][i]["mid"];
          subStreams[mid] = msg["streams"][i];
          let feed = feedStreams[msg["streams"][i]["feed_id"]];
          if(feed && feed.slot) {
            slots[mid] = feed.slot;
            mids[feed.slot] = mid;
          }
        }
      }
      if(jsep) {
        Janus.debug("Handling SDP as well...", jsep);
        // Answer and attach
        remoteFeed?.createAnswer({
          jsep: jsep,
          // We only specify data channels here, as this way in
          // case they were offered we'll enable them. Since we
          // don't mention audio or video tracks, we autoaccept them
          // as recvonly (since we won't capture anything ourselves)
          tracks: [
            { type: 'data', capture: true },
          ],
          success: (jsep) => {
            Janus.debug("Got SDP!");
            Janus.debug(jsep);
            let body = { request: "start", room: myroom };
            remoteFeed?.send({ message: body, jsep: jsep });
          },
          error: function(error) {
            Janus.error("WebRTC error:", error);
          }
        });
      }
    },
    onlocaltrack: (track, on) => {
      // The subscriber stream is recvonly, we don't expect anything here
    },
    onremotetrack: (track, mid, on) => {
      setRefresh(prev => !prev);
      Janus.debug(
        "Remote track (mid=" + mid + ") " +
        (on ? "added" : "removed") + ":", track
      );
      // Which publisher are we getting on this mid?
      let sub = subStreams[mid];
      let feed = feedStreams[sub.feed_id];
      Janus.debug(" >> This track is coming from feed " + sub.feed_id + ":", feed);
      let slot = slots[mid];
      if(feed && !slot) {
        slot = feed.slot;
        slots[mid] = feed.slot;
        mids[feed.slot] = mid;
      }
      Janus.debug(" >> mid " + mid + " is in slot " + slot);
      if(!on) {
        // Track removed, get rid of the stream and the rendering
        if(track.kind === "video" && feed) {
          feed.remoteVideos--;
          if(feed.remoteVideos === 0) {
            // No video, at least for now: show a placeholder
          }
        }
        delete remoteTracks[mid];
        delete slots[mid];
        delete mids[slot];
        return;
      }
      // If we're here, a new track was added
      if(feed.spinner) {
        feed.spinner.stop();
        feed.spinner = null;
      }
      // if($('#remotevideo' + slot + '-' + mid).length > 0)
      //   return;
      if(track.kind === "audio") {
        // New audio track: create a stream out of it, and use a hidden <audio> element
        let stream = new MediaStream([track]);
        remoteTracks[mid] = stream;
        Janus.log("Created remote audio stream:", stream);
        if(feed.remoteVideos === 0) {
          // No video, at least for now: TODO show a placeholder
        }
      } else {
        // New video track: create a stream out of it
        feed.remoteVideos++;
        let stream = new MediaStream([track]);
        remoteTracks[mid] = stream;
        Janus.log("Created remote video stream:", stream);
      }
    },
    oncleanup: () => {
      setRefresh(prev => !prev);
      Janus.log(" ::: Got a cleanup notification (remote feed) :::");
      for(let i=1;i<6;i++) {
        if(bitrateTimer[i]) {
          clearInterval(bitrateTimer[i]);
        }
        bitrateTimer[i] = null;
        feedStreams[i].simulcastStarted = false;
        feedStreams[i].svcStarted = false;
        feedStreams[i].remoteVideos = 0;
      }
      remoteTracks = {};
    }
  });
}

  const unsubscribeFrom = (id: string) => {
    // Unsubscribe from this publisher
    let feed = feedStreams[id];
    if (!feed) {
      return;
    }
    Janus.debug("Feed " + id + " (" + feed.display + ") has left the room, detaching");
    if(bitrateTimer[feed.slot]) {
      clearInterval(bitrateTimer[feed.slot]);
    }
    bitrateTimer[feed.slot] = null;
    delete simulcastStarted[feed.slot];
    delete svcStarted[feed.slot];
    delete feeds[feed.slot];
    feeds.slot = 0;
    delete feedStreams[id];
    // Send an unsubscribe request
    let unsubscribe = {
      request: "unsubscribe",
      streams: [{ feed: parseInt(id) }]
    };
    if(remoteFeed != null) {
      remoteFeed.send({ message: unsubscribe });
    }
    delete subscriptions[id];
  }

  const disconnect = () => {
    unpublishOwnFeed();
    const leave = { request: "leave" }
    sfutest?.send({ message: leave });
    Object.keys(feedStreams).forEach((id) => {
      unsubscribeFrom(id);
    });
  };

  return {
    refresh,
    toggleMute, 
    publishOwnFeed, 
    unpublishOwnFeed, 
    joinRoom,
    subscribeTo, 
    unsubscribeFrom,
    disconnect,
  }
}


export { 
  sfutest,
  feeds,
  feedStreams, 
  localTracks, 
  remoteTracks,
};

export default useJanus;
