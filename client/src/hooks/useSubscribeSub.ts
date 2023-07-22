import { gql, useSubscription } from "@apollo/client";
import { useAppSelector } from "../store";
import { selectAppUser } from "../slices/userSlice";
import { selectActiveChannel } from "../slices/channelSlice";
import useAnswer from "./useAnswer";
import useStart from "./useStart";


const SUBSCRIBE_SUB = gql`
  subscription Subscribed($userId: Int, $channelId: Int) {
    subscribed(userId: $userId, channelId: $channelId) {
      feed
      display
      jsep {
        type
        sdp 
      }
    }
  }
`;

const useSubscribeSub = () => {
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectActiveChannel);
  const doAnswer = useAnswer();
  const start = useStart();

  useSubscription(SUBSCRIBE_SUB, {
    variables: {
      userId: user?.id,
      channelId: channel?.id,
    },
    onError: err => {
      console.log(err);
    },
    onData: async ({ data: {data: { subscribed }}}) => {
      console.log(subscribed);

      try {
        const answer = await doAnswer(subscribed.feed, subscribed.display, subscribed.jsep);
        start(subscribed.feed, answer);
      } catch (err) {
        console.log('error while doing answer', err);
      }
    },
  })
}


export default useSubscribeSub;