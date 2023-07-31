import { gql, useSubscription } from "@apollo/client"
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { closePC } from "../utils";
import { useContext } from "react";
import { AppContext } from "../App";

const LEAVING_SUB = gql`
  subscription Leaving($feed: Int) {
    leaving(feed: $feed) {
      room
      feed
      reason
    }
  }
`;

const useLeavingSub = () => {
  const {
    pcMap,
    setPcMap,
    setVidMap,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  useSubscription(LEAVING_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {leaving}}}) => {
      console.log(leaving);      
      if (leaving.feed) {
        setVidMap(prev => {
          const newVidMap = { ...prev }
          delete newVidMap[leaving.feed];
          return newVidMap;
        })
        closePC(pcMap, leaving.feed, setPcMap);
      }
    }
  });
}

export default useLeavingSub;