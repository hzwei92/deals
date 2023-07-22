import { gql, useMutation } from "@apollo/client"
import { useContext } from "react";
import { AppContext } from "../App";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";

const CONFIGURE = gql`
  mutation Configure($channelId: Int!, $feed: Float!, $audio: Boolean!, $video: Boolean!, $data: Boolean!, $jsep: JsepInput, $restart: Boolean, $sc_substream_layer: Int, $sc_temporal_layers: Int) {
    configure(channelId: $channelId, feed: $feed, audio: $audio, video: $video, data: $data, jsep: $jsep, restart: $restart, sc_substream_layer: $sc_substream_layer, sc_temporal_layers: $sc_temporal_layers)
  }
`;

const useConfigure = () => {
  const { 
    pendingOfferMap,
    setPendingOfferMap,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);

  const [configureChannel] = useMutation(CONFIGURE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const configure = (channelId: number, feed: number, jsep: any, restart: boolean, substream: any, temporal: any) => {
    if (!user) return;
    const variables = {
      channelId,
      feed,
      audio: true,
      video: true,
      data: true,
    } as any;
    if (typeof substream !== 'undefined') variables.sc_substream_layer = substream;
    if (typeof temporal !== 'undefined') variables.sc_temporal_layers = temporal;
    if (jsep) variables.jsep = jsep;
    if (typeof restart === 'boolean') variables.restart = restart;
  
    configureChannel({ variables });

    if (jsep) {
      setPendingOfferMap({ ...pendingOfferMap, [user.id]: { 
        feed 
      }});
    }
  }

  return configure;
};

export default useConfigure;