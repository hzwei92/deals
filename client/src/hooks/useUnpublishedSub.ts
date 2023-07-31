import { gql, useSubscription } from "@apollo/client"
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { closePC } from "../utils";
import { useContext } from "react";
import { AppContext } from "../App";

const UNPUBLISHED_SUB = gql`
  subscription Unpublished($feed: Int) {
    unpublished(feed: $feed) {
      room
      feed
    }
  }
`;

const useUnpublishedSub = () => {
  const {
    pcMap,
    setPcMap,
    setVidMap,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  useSubscription(UNPUBLISHED_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {unpublished}}}) => {
      console.log(unpublished);      
      if (unpublished.feed) {
        setVidMap(prev => {
          const newVidMap = { ...prev }
          delete newVidMap[unpublished.feed];
          return newVidMap;
        })
        closePC(pcMap, unpublished.feed, setPcMap);
      }
    }
  });
}

export default useUnpublishedSub;