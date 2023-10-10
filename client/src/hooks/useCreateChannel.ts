import { gql, useMutation } from "@apollo/client";
import { CHANNEL_FIELDS } from "../fragments/channel";
import { useAppDispatch } from "../store";
import { addChannels } from "../slices/channelSlice";
import { useIonRouter } from "@ionic/react";
import { addMemberships } from "../slices/membershipSlice";
import { MEMBERSHIP_FIELDS } from "../fragments/membership";

const CREATE_CHANNEL = gql`
  mutation CreateChannel($lng: Float!, $lat: Float!) {
    createChannel(lng: $lng, lat: $lat) {
      channel {
        ...ChannelFields
      }
      membership {
        ...MembershipFields
      }
    }
  }
  ${CHANNEL_FIELDS}
  ${MEMBERSHIP_FIELDS}
`;


const useCreateChannel = (setShouldReloadMapSource: (should: boolean) => void) => {
  const router = useIonRouter();

  const dispatch = useAppDispatch();

  const [create] = useMutation(CREATE_CHANNEL, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addChannels([data.createChannel.channel]));
      dispatch(addMemberships([data.createChannel.membership]));

      router.push('/channel/' + data.createChannel.membership.channelId + '/call');
      setShouldReloadMapSource(true);
    },
  });

  const createChannel = (lng: number, lat: number) => {
    create({
      variables: {
        lng,
        lat,
      }
    });
  }

  return createChannel;
};

export default useCreateChannel;
