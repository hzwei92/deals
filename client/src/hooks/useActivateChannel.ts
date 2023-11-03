import { gql, useMutation } from "@apollo/client";
import { useAppDispatch } from "../store";
import { addUsers } from "../slices/userSlice";
import { addChannels } from "../slices/channelSlice";
import { USER_FIELDS } from "../fragments/user";
import { CHANNEL_FIELDS } from "../fragments/channel";
import { addMemberships } from "../slices/membershipSlice";
import { MEMBERSHIP_FIELDS } from "../fragments/membership";

const ACTIVATE_CHANNEL = gql`
  mutation ActivateChannel($channelId: Int) {
    activateChannel(channelId: $channelId) {
      user {
        ...UserFields
      }
      channels {
        ...ChannelFields
      }
      memberships {
        ...MembershipFields
      }
    }
  }
  ${USER_FIELDS}
  ${CHANNEL_FIELDS}
  ${MEMBERSHIP_FIELDS}
`;


const useActivateChannel = () => {
  const dispatch = useAppDispatch();

  const [activateChannel] = useMutation(ACTIVATE_CHANNEL, {
    onError: error => {
      console.log(error);
    },
    onCompleted: data => {
      console.log(data);
      
      dispatch(addUsers([data.activateChannel.user]));
      dispatch(addChannels(data.activateChannel.channels));
      dispatch(addMemberships(data.activateChannel.memberships));
    },
  })
  


  const activate = (channelId: number | null) => {
    activateChannel({
      variables: {
        channelId,
      }
    });
  }

  return activate;
}

export default useActivateChannel;