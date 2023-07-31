import { gql, useMutation } from "@apollo/client";
import { useContext } from "react";
import { AppContext } from "../App";
import { closeAllPCs, closePC } from "../utils";

const LEAVE_ROOM = gql`
  mutation Leave {
    leave {
      room
      feed
      reason
    }
  }
`;

const useLeave = () => {
  const {
    pcMap,
    setPcMap,
    setVidMap,
    setPendingOfferMap,
  } = useContext(AppContext);

  const [leaveRoom] = useMutation(LEAVE_ROOM, {
    onError: err => {
      console.error(err);
    },
    onCompleted: async ({ leave }) => {
      console.log(leave);
      // if (leave?.feed) {
      //   setVidMap(prev => {
      //     const newVidMap = { ...prev }
      //     delete newVidMap[leave.feed];
      //     return newVidMap;
      //   })
      //   closePC(pcMap, leave.feed, setPcMap);
      // }
      setPendingOfferMap({});
      setVidMap({});
      closeAllPCs(pcMap, setPcMap);
    },
  });
  const leave = () => {
    leaveRoom();
  }

  return leave;
}

export default useLeave;