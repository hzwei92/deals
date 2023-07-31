import { gql, useSubscription } from "@apollo/client"
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { AppContext } from "../App";
import { useContext } from "react";

const DISPLAY_SUB = gql`
  subscription Display($feed: Int) {
    display(feed: $feed) {
      room
      feed
      display
    }
  }
`;

const useDisplaySub = () => {
  const {
    setVidMap,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  useSubscription(DISPLAY_SUB, {
    variables: {
      feed: user?.id,
    },
    shouldResubscribe: true,
    onError: err => {
      console.error(err);
    },
    onData: ({data: {data: {display}}}) => {
      console.log(display);
      setVidMap(prev => {
        const newVidMap = { ...prev }
        newVidMap[display.feed].display = display.display;
        return newVidMap;
      })
    }
  })
}

export default useDisplaySub;