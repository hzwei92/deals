import { gql, useMutation } from "@apollo/client";
import { MEMBERSHIP_FIELDS } from "../fragments/membership";
import { CHANNEL_FIELDS } from "../fragments/channel";
import { useAppDispatch } from "../store";
import { addMemberships } from "../slices/membershipSlice";

const GET_MEMBERSHIPS = gql`
  mutation GetMemberships {
    getMemberships {
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
  const [get] = useMutation(GET_MEMBERSHIPS, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addMemberships(data.getMemberships));

      setShouldAddMapSource(true);
    },
  });

  const getMemberships = () => {
    get();
  };

  return getMemberships
}

export default useGetMemberships;