import { gql, useSubscription } from '@apollo/client';
import { POST_FIELDS } from '../fragments/post';
import { useAppDispatch } from '../store';
import { addPosts } from '../slices/postSlice';

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
  const dispatch = useAppDispatch();

  useSubscription(SUB_POST_UPDATED, {
    variables: { channelIds },
    shouldResubscribe: true,
    onData: ({ data: {data: { postUpdated }} }) => {
      console.log(postUpdated);

      dispatch(addPosts([postUpdated]));
    }
  });
}

export default useSubPostUpdated;
