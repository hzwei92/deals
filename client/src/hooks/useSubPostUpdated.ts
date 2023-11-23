import { gql, useSubscription } from '@apollo/client';
import { POST_FIELDS } from '../fragments/post';
import { useAppDispatch, useAppSelector } from '../store';
import { addPosts } from '../slices/postSlice';
import { selectChannels, selectFocusChannel } from '../slices/channelSlice';
import { useIonToast } from '@ionic/react';

const SUB_POST_UPDATED = gql`
  subscription PostUpdated($channelIds: [Int!]!) {
    postUpdated(channelIds: $channelIds) {
      ...PostFields
      user {
        id
        name
        email
      }
    }
  }
  ${POST_FIELDS}
`;


function useSubPostUpdated(channelIds: number[]) {
  const [present] = useIonToast();
  
  const dispatch = useAppDispatch();

  const channel = useAppSelector(selectFocusChannel);

  const channels = useAppSelector(selectChannels);

  useSubscription(SUB_POST_UPDATED, {
    variables: { channelIds },
    shouldResubscribe: true,
    onData: ({ data: {data: { postUpdated }} }) => {
      console.log(postUpdated);

      if (postUpdated.channelId !== channel?.id) {
        present({
          message: `${postUpdated.user.name} has posted to ${channels[postUpdated.channelId]?.name}`,
          duration: 5000,
          position: 'top',
          htmlAttributes: {
            style: {
              top: 20,
            }
          }
        })
      }

      dispatch(addPosts([postUpdated]));
    }
  });
}

export default useSubPostUpdated;
