

import { gql, useMutation } from "@apollo/client";
import { Publisher } from "../types/Publisher";

const SUBSCRIBE_FEED = gql`
  mutation Subscribe($feed: Float!, $channelId: Int!, $sc_substream_layer: Int, $sc_temporal_layers: Int) {
    subscribe(feed: $feed, channelId: $channelId, sc_substream_layer: $sc_substream_layer, sc_temporal_layers: $sc_temporal_layers)
  }
`;

const useSubscribe = () => {
  const [subscribeFeed] = useMutation(SUBSCRIBE_FEED, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
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