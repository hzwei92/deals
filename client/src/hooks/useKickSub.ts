import { gql, useSubscription } from "@apollo/client"
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { useContext } from "react";
import { AppContext } from "../App";
import { closePC } from "../utils";

const KICK_SUB = gql`
  subscription Kicked($feed: Int) {
    kicked(feed: $feed) {
      room
      feed
    }
  }
`;

const useKickSub = () => {
  const {
    pcMap,
    setPcMap,
    setVidMap,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  useSubscription(KICK_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {kicked}}}) => {
      console.log(kicked);
      if (kicked.feed) {
        setVidMap(prev => {
          const newVidMap = { ...prev }
          delete newVidMap[kicked.feed];
          return newVidMap;
        })
        closePC(pcMap, kicked.feed, setPcMap);
      }
    }
  });
}

export default useKickSub;