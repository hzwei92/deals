import { gql, useSubscription } from "@apollo/client"
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";

const TALKING_SUB = gql`
  subscription Talking($feed: Int) {
    talking(feed: $feed) {
      room
      feed
      talking
      audio_level
    }
  }
`;

const useTalkingSub = () => {
  const user = useAppSelector(selectAppUser);
  useSubscription(TALKING_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {talking}}}) => {
      console.log(talking);
    }
  })
}

export default useTalkingSub;