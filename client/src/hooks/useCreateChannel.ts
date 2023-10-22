import { gql, useMutation } from "@apollo/client";
import { CHANNEL_FIELDS } from "../fragments/channel";
import { useAppDispatch } from "../store";
import { addChannels } from "../slices/channelSlice";
import { useIonRouter } from "@ionic/react";
import { addMemberships } from "../slices/membershipSlice";
import { MEMBERSHIP_FIELDS } from "../fragments/membership";
import { useContext } from "react";
import { AppContext } from "../App";

const CREATE_CHANNEL = gql`
  mutation CreateChannel($lng: Float!, $lat: Float!, $name: String!, $url: String!, $desc: String!) {
    createChannel(lng: $lng, lat: $lat, name: $name, url: $url, desc: $desc) {
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


const useCreateChannel = (handleError: (err: any) => void, handleSuccess: () => void) => {
  const router = useIonRouter();

  const dispatch = useAppDispatch();

  const {
    setShouldUpdateMapData,
    newChannelLngLat,
  } = useContext(AppContext);


  const [create] = useMutation(CREATE_CHANNEL, {
    onError: err => {
      console.log(err);
      handleError(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addChannels([data.createChannel.channel]));
      dispatch(addMemberships([data.createChannel.membership]));

      router.push('/channel/' + data.createChannel.membership.channelId + '/talk');
      setShouldUpdateMapData(true);

      handleSuccess();
    },
  });

  const createChannel = (name: string, url: string, desc: string) => {
    if (!newChannelLngLat) return;
    const { lng, lat } = newChannelLngLat;
    create({
      variables: {
        lng,
        lat,
        name, 
        url,
        desc,
      }
    });
  }

  return createChannel;
};

export default useCreateChannel;
