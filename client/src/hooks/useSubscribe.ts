

import { gql, useMutation } from "@apollo/client";
import { Publisher } from "../types/Publisher";
import useAnswer from "./useAnswer";
import useStart from "./useStart";

const SUBSCRIBE_FEED = gql`
  mutation Subscribe($feed: Int!, $room: Int!, $audio: Boolean, $video: Boolean, $data: Boolean $sc_substream_layer: Int, $sc_temporal_layers: Int) {
    subscribe(feed: $feed, room: $room, audio: $audio, video: $video, data: $data, sc_substream_layer: $sc_substream_layer, sc_temporal_layers: $sc_temporal_layers) {
      room
      feed
      display
      jsep {
        type
        sdp
      }
    }
  }
`;

const useSubscribe = () => {
  const doAnswer = useAnswer();
  const start = useStart();

  const [subscribeFeed] = useMutation(SUBSCRIBE_FEED, {
    onError: err => {
      console.error(err);
    },
    onCompleted: async ({ subscribe }) => {
      console.log(subscribe);
      try {
        const answer = await doAnswer(subscribe.feed, subscribe.display, subscribe.jsep);
        await new Promise(r => setTimeout(r, 10000))
        start(subscribe.feed, answer);
      } catch (err) {
        console.log('error while doing answer', err);
      }
    },
  });

  const subscribe = (feed: number, room: number, substream: any, temporal: any) => {
    const variables = { 
      audio: true,
      video: true,
      data: true,
      feed, 
      room 
    } as any;
  
    if (typeof substream !== 'undefined') variables.sc_substream_layer = substream;
    if (typeof temporal !== 'undefined') variables.sc_temporal_layers = temporal;
    subscribeFeed({ variables });
  }

  const subscribeTo = (peers: Publisher[], room: number) => {
    peers.forEach(peer => {
      subscribe(peer.feed, room, undefined, undefined);
    });
  }

  return { subscribe, subscribeTo };
}

export default useSubscribe;