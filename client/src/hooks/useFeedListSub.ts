import { gql, useSubscription } from "@apollo/client"
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import useSubscribe from "./useSubscribe";

const FEED_LIST_SUB = gql`
  subscription FeedList($feed: Int) {
    feedList(feed: $feed) {
      room
      feed
      publishers {
        feed
        display
        talking
        audiocodec
        videocodec
        streams {
          type
          mindex
          mid
          codec
          fec
        }
      }
    }
  }
`;

const useFeedListSub = () => {
  const { subscribeTo } = useSubscribe();

  const user = useAppSelector(selectAppUser);
  useSubscription(FEED_LIST_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {feedList}}}) => {
      console.log(feedList);
      subscribeTo(feedList.publishers, feedList.room)
    }
  });
}

export default useFeedListSub;