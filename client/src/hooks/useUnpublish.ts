import { gql, useMutation } from "@apollo/client"
import { useContext } from "react";
import { AppContext } from "../App";
import { closePC } from "../utils";

const UNPUBLISH = gql`
  mutation Unpublish($feed: Int!) {
    unpublish(feed: $feed) {
      room
      feed
    }
  }
`;
const useUnpublish = () => {
  const { 
    pcMap,
    setPcMap,
    setVidMap,
  } = useContext(AppContext);

  const [unpub] = useMutation(UNPUBLISH, {
    onError: err => {
      console.error(err);
    },
    onCompleted: ({ unpublish }) => {
      console.log(unpublish);
      if (unpublish.feed) {
        setVidMap(prev => {
          const newVidMap = { ...prev }
          delete newVidMap[unpublish.feed];
          return newVidMap;
        })
        closePC(pcMap, unpublish.feed, setPcMap);
      }
    },
  });

  const unpublish = () => {
    unpub();
  }

  return unpublish;
};

export default useUnpublish;