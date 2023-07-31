import { gql, useSubscription } from "@apollo/client"
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";

const FEED_JOINED_SUB = gql`
  subscription FeedJoined($feed: Int) {
    feedJoined(feed: $feed) {
      room
      feed
      display
    }
  }
`;

const useFeedJoinedSub = () => {
  const user = useAppSelector(selectAppUser);
  useSubscription(FEED_JOINED_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {feedJoined}}}) => {
      console.log(feedJoined);
    }
  });
}

export default useFeedJoinedSub;