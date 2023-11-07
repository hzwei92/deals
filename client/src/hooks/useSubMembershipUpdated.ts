import { gql, useSubscription } from '@apollo/client';
import { MEMBERSHIP_FIELDS } from '../fragments/membership';
import { useAppDispatch } from '../store';
import { addMemberships } from '../slices/membershipSlice';

const SUB_MEMBERSHIP_UPDATED = gql`
  subscription MembershipUpdated($channelIds: [Int!]!) {
    membershipUpdated(channelIds: $channelIds) {
      ...MembershipFields
    }
  }
  ${MEMBERSHIP_FIELDS}
`;


function useSubMembershipUpdated(channelIds: number[]) {
  const dispatch = useAppDispatch();

  useSubscription(SUB_MEMBERSHIP_UPDATED, {
    variables: { channelIds },
    shouldResubscribe: true,
    onData: ({ data: {data: { membershipUpdated }} }) => {
      console.log(membershipUpdated);

      dispatch(addMemberships([membershipUpdated]));
    }
  });
}

export default useSubMembershipUpdated;
