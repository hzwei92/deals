import { gql, useSubscription } from '@apollo/client';
import { MEMBERSHIP_FIELDS } from '../fragments/membership';
import { useAppDispatch, useAppSelector } from '../store';
import { addMemberships } from '../slices/membershipSlice';
import { selectChannels, selectFocusChannel } from '../slices/channelSlice';
import { useIonToast } from '@ionic/react';

const SUB_MEMBERSHIP_UPDATED = gql`
  subscription MembershipUpdated($channelIds: [Int!]!) {
    membershipUpdated(channelIds: $channelIds) {
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


function useSubMembershipUpdated(channelIds: number[]) {
  const [present] = useIonToast();

  const dispatch = useAppDispatch();

  const channel = useAppSelector(selectFocusChannel);

  const channels = useAppSelector(selectChannels);

  useSubscription(SUB_MEMBERSHIP_UPDATED, {
    variables: { channelIds },
    shouldResubscribe: true,
    onData: ({ data: {data: { membershipUpdated }} }) => {
      console.log(membershipUpdated);

      if (membershipUpdated.isActive && membershipUpdated.channelId !== channel?.id) {
        present({
          message: `${membershipUpdated.user.name} has joined ${channels[membershipUpdated.channelId]?.name}`,
          duration: 5000,
        });
      }
      dispatch(addMemberships([membershipUpdated]));
    }
  });
}

export default useSubMembershipUpdated;
