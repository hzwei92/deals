import { gql, useSubscription } from "@apollo/client"
import { useAppSelector } from "../store";
import { selectAppUser } from "../slices/userSlice";
import { useContext } from "react";
import { AppContext } from "../App";
import { closePC } from "../utils";

const ERROR_SUB = gql`
  subscription Error($feed: Int) {
    error(feed: $feed) {
      error
      request
    }
  }
`;
const useErrorSub = () => {
  const { 
    pcMap,
    setPcMap,
    pendingOfferMap,
    setPendingOfferMap,
    setVidMap,
  } = useContext(AppContext);
  const user = useAppSelector(selectAppUser);

  useSubscription(ERROR_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {error}}}) => {
      console.log(error);

      if (!user) return;

      if (pendingOfferMap[user.id]) {
        closePC(pcMap, user.id, setPcMap);

        setPendingOfferMap(prev => {
          const newPendingOfferMap = { ...prev };
          delete newPendingOfferMap[user.id];
          return newPendingOfferMap;
        });
        setVidMap(prev => {
          const newVidMap = { ...prev };
          delete newVidMap[user.id];
          return newVidMap;
        });
      }
    }
  });
}

export default useErrorSub;