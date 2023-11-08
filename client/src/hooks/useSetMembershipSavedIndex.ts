import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { MEMBERSHIP_FIELDS } from '../fragments/membership';
import { useAppDispatch } from '../store';
import { addMemberships } from '../slices/membershipSlice';

const SET_MEMBERSHIP_SAVED_INDEX = gql`
  mutation SetMembershipSavedIndex($membershipId: Int!, $index: Int) {
    setMembershipSavedIndex(membershipId: $membershipId, index: $index) {
      ...MembershipFields
    }
  }
  ${MEMBERSHIP_FIELDS}
`;

export const useSetMembershipSavedIndex = () => {
  const dispatch = useAppDispatch();

  const [setIndex] = useMutation(SET_MEMBERSHIP_SAVED_INDEX, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(addMemberships(data.setMembershipSavedIndex));
    }
  });

  const setMembershipSavedIndex = (membershipId: number, index: number | null) => {
    setIndex({
      variables: {
        membershipId,
        index,
      }
    });
  }

  return setMembershipSavedIndex;
};
