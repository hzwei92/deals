import { gql, useMutation } from "@apollo/client";
import { MEMBERSHIP_FIELDS } from "../fragments/membership";
import { CHANNEL_FIELDS } from "../fragments/channel";
import { useAppDispatch } from "../store";
import { addMemberships } from "../slices/membershipSlice";

const GET_MEMBERSHIPS_BY_USER = gql`
  mutation GetMembershipsByUserId($userId: Int!) {
    getMembershipsByUserId(userId: $userId) {
      ...MembershipFields
      channel {
        ...ChannelFields
      }
    }
  }
  ${MEMBERSHIP_FIELDS}
  ${CHANNEL_FIELDS}
`;

const useGetMemberships = (setShouldAddMapSource: (should: boolean) => void) => {
  const dispatch = useAppDispatch();
  const [getByUser] = useMutation(GET_MEMBERSHIPS_BY_USER, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addMemberships(data.getMembershipsByUserId));

      setShouldAddMapSource(true);
    },
  });

  const getMembershipsByUser = (userId: number) => {
    getByUser({
      variables: {
        userId,
      }
    });
  };

  return {
    getMembershipsByUser,
  }
}

export default useGetMemberships;