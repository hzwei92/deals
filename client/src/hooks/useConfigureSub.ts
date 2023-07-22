import { gql, useSubscription } from "@apollo/client";
import { useAppSelector } from "../store";
import { selectAppUser } from "../slices/userSlice";
import { selectActiveChannel } from "../slices/channelSlice";
import useAnswer from "./useAnswer";
import useStart from "./useStart";
import { useContext } from "react";
import { AppContext } from "../App";


const CONFIGURE_SUB = gql`
  subscription Configured($userId: Int, $channelId: Int) {
    configured(userId: $userId, channelId: $channelId) {
      feed
      room
      jsep {
        type
        sdp 
      }
    }
  }
`;

const useConfigureSub = () => {
  const { 
    pcMap,
    pendingOfferMap,
    setPendingOfferMap
  } = useContext(AppContext);
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectActiveChannel);
  const doAnswer = useAnswer();
  const start = useStart();

  useSubscription(CONFIGURE_SUB, {
    variables: {
      userId: user?.id,
      channelId: channel?.id,
    },
    onError: err => {
      console.log(err);
    },
    onData: async ({ data: {data: { configured }}}) => {
      console.log(configured);

      const newPendingOfferMap = { ...pendingOfferMap };
      delete newPendingOfferMap[configured.room];
      setPendingOfferMap(newPendingOfferMap)

      const pc = pcMap[configured.feed];

      if (pc && configured.jsep) {
        try {
          await pc.setRemoteDescription(configured.jsep);
          console.log('configure remote sdp OK');
          if (configured.jsep.type === 'offer') {
            const answer = await doAnswer(configured.feed, null, configured.jsep);
            start(configured.feed, answer);
          }
        } catch (e) {
          console.log('error setting remote sdp', e);
        }
      }
    },
  })
}

export default useConfigureSub;