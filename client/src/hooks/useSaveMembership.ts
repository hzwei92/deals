import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { MEMBERSHIP_FIELDS } from '../fragments/membership';
import { useAppDispatch } from '../store';
import { addMemberships } from '../slices/membershipSlice';

const SET_MEMBERSHIP_SAVED_INDEX = gql`
  mutation SaveMembership($membershipId: Int!, $isSaved: Boolean!) {
    saveMembership(membershipId: $membershipId, isSaved: $isSaved) {
      ...MembershipFields
    }
  }
  ${MEMBERSHIP_FIELDS}
`;

export const useSaveMembership = () => {
  const dispatch = useAppDispatch();

  const [save] = useMutation(SET_MEMBERSHIP_SAVED_INDEX, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(addMemberships([data.saveMembership]));
    }
  });

  const saveMembership = (membershipId: number, isSaved: boolean) => {
    save({
      variables: {
        membershipId,
        isSaved,
      }
    });
  }

  return saveMembership;
};
