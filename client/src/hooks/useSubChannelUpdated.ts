import { gql, useSubscription } from '@apollo/client';
import { CHANNEL_FIELDS } from '../fragments/channel';
import { useAppDispatch } from '../store';
import { addChannels } from '../slices/channelSlice';

const SUB_CHANNEL_UPDATED = gql`
  subscription ChannelUpdated($minLat: Float!, $maxLat: Float!, $minLng: Float!, $maxLng: Float!) {
    channelUpdated(minLat: $minLat, maxLat: $maxLat, minLng: $minLng, maxLng: $maxLng) {
      ...ChannelFields
    }
  }
  ${CHANNEL_FIELDS}
`;


function useSubChannelUpdated(setShouldUpdateMapData: (x: boolean) => void, minLat: number, maxLat: number, minLng: number, maxLng: number) {
  const dispatch = useAppDispatch();

  useSubscription(SUB_CHANNEL_UPDATED, {
    variables: { minLat, maxLat, minLng, maxLng },
    shouldResubscribe: true,
    onData: ({ data: {data: { channelUpdated }} }) => {
      console.log(channelUpdated);

      dispatch(addChannels([channelUpdated]));

      setShouldUpdateMapData(true);
    }
  });
}

export default useSubChannelUpdated;
