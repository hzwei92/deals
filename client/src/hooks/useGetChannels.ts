import { gql, useMutation } from "@apollo/client";
import { CHANNEL_FIELDS } from "../fragments/channel";
import { useAppDispatch } from "../store";
import { addChannels } from "../slices/channelSlice";

const GET_ACTIVE_CHANNELS = gql`
  mutation GetActiveChannels($lng: Float!, $lat: Float!) {
    getActiveChannels(lng: $lng, lat: $lat) {
      ...ChannelFields
    }
  }
  ${CHANNEL_FIELDS}
`;
const GET_CHANNELS = gql`
  mutation GetChannels($lng: Float!, $lat: Float!) {
    getChannels(lng: $lng, lat: $lat) {
      ...ChannelFields
    }
  }
  ${CHANNEL_FIELDS}
`;


const useGetChannels = (setShouldUpdateMapData: (should: boolean) => void) => {
  const dispatch = useAppDispatch();

  const [get] = useMutation(GET_CHANNELS, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(addChannels(data.getChannels));
      setShouldUpdateMapData(true);
    },
  });

  const getActiveChannels = (lng: number, lat: number) => {
    get({
      variables: {
        lng,
        lat,
      }
    });
  };

  return getActiveChannels;
}

export default useGetChannels

