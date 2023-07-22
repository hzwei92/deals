import { gql, useSubscription } from "@apollo/client";
import { selectActiveChannel } from "../slices/channelSlice";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import useConfigure from "./useConfigure";
import useOffer from "./useOffer";
import useSubscribe from "./useSubscribe";
import { useContext } from "react";
import { AppContext } from "../App";


const JOIN_SUB = gql`
  subscription Joined($userId: Int, $channelId: Int) {
    joined(userId: $userId, channelId: $channelId) {
      feed
      room
      display
      publishers {
        feed
        display
      }
    }
  }
`;

const useJoinSub = () => {
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectActiveChannel);
  
  const doOffer = useOffer();
  const configure = useConfigure();
  const { subscribeTo } = useSubscribe();

  useSubscription(JOIN_SUB, {
    variables: {
      userId: user?.id,
      channelId: channel?.id,
    },
    onError: err => {
      console.error(err);
    },
    shouldResubscribe: true,
    onData: async ({ data: { data: { joined } } }) => {
      console.log(joined);
      if (!channel) return;
      try {
        const offer = await doOffer(joined.feed, joined.display);
        configure(channel?.id, joined.feed, offer, false, undefined, undefined);
        subscribeTo(joined.publishers, joined.room)
      } catch (err) {
        console.log('error while doing offer', err);
      }
    }
  })
}

export default useJoinSub;