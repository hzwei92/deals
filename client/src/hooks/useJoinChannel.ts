import { gql, useMutation } from "@apollo/client";
import { useAppDispatch } from "../store";
import { addChannels } from "../slices/channelSlice";
import { CHANNEL_FIELDS } from "../fragments/channel";
import { MEMBERSHIP_FIELDS } from "../fragments/membership";
import { addMemberships } from "../slices/membershipSlice";

const JOIN_CHANNEL = gql`
  mutation JoinChannel($channelId: Int!) {
    joinChannel(channelId: $channelId) {
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


const useJoinChannel = () => {
  const dispatch = useAppDispatch();

  const [join] = useMutation(JOIN_CHANNEL, {
    onError: error => {
      console.log(error);
    },
    onCompleted: data => {
      console.log(data);
      
      dispatch(addChannels([data.joinChannel.channel]));
      dispatch(addMemberships([data.joinChannel.membership]));
    },
  })

  const joinChannel = (channelId: number) => {
    join({
      variables: {
        channelId,
      }
    });
  }

  return joinChannel;
}

export default useJoinChannel;