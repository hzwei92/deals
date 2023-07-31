import { gql, useSubscription } from "@apollo/client"
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import useDisconnect from "./useDisconnect";

const DESTROYED_SUB = gql`
  subscription Destroyed($feed: Int) {
    destroyed(feed: $feed) {
      room
      permanent
    }
  }
`;

const useDestroyedSub = () => {
  const disconnect = useDisconnect();

  const user = useAppSelector(selectAppUser);
  useSubscription(DESTROYED_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {destroyed}}}) => {
      console.log(destroyed);
      disconnect();
    }
  })
}

export default useDestroyedSub;