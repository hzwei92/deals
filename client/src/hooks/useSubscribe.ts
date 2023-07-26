

import { gql, useMutation } from "@apollo/client";
import { Publisher } from "../types/Publisher";
import useAnswer from "./useAnswer";
import useStart from "./useStart";

const SUBSCRIBE_FEED = gql`
  mutation Subscribe($feed: Float!, $channelId: Int!, $sc_substream_layer: Int, $sc_temporal_layers: Int) {
    subscribe(feed: $feed, channelId: $channelId, sc_substream_layer: $sc_substream_layer, sc_temporal_layers: $sc_temporal_layers) {
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
        start(subscribe.feed, answer);
      } catch (err) {
        console.log('error while doing answer', err);
      }
    },
  });

  const subscribe = (feed: number, channelId: number, substream: any, temporal: any) => {
    const variables = { feed, channelId } as any;
    if (typeof substream !== 'undefined') variables.sc_substream_layer = substream;
    if (typeof temporal !== 'undefined') variables.sc_temporal_layers = temporal;
    subscribeFeed({ variables });
  }

  const subscribeTo = (peers: Publisher[], channelId: number) => {
    peers.forEach(peer => {
      subscribe(peer.feed, channelId, undefined, undefined);
    });
  }

  return { subscribe, subscribeTo };
}

export default useSubscribe;