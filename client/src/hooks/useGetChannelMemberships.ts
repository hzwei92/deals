import { gql, useMutation } from "@apollo/client";
import { MEMBERSHIP_FIELDS } from "../fragments/membership";
import { useAppDispatch } from "../store";
import { addMemberships } from "../slices/membershipSlice";
import { USER_FIELDS } from "../fragments/user";

const GET_CHANNEL_MEMBERSHIPS = gql`
  mutation GetChannelMemberships($channelId: Int!) {
    getChannelMemberships(channelId: $channelId) {
      ...MembershipFields
      user {
        id
        name
        email
      }
    }
  }
  ${MEMBERSHIP_FIELDS}
`;

const useGetChannelMemberships = () => {
  const dispatch = useAppDispatch();
  const [get] = useMutation(GET_CHANNEL_MEMBERSHIPS, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addMemberships(data.getChannelMemberships));
    },
  });

  const getChannelMemberships = (channelId: number) => {
    get({
      variables: {
        channelId,
      }
    });
  };

  return getChannelMemberships
}

export default useGetChannelMemberships;