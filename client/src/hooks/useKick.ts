import { gql, useMutation } from "@apollo/client";
import { useContext } from "react";
import { AppContext } from "../App";
import { closePC } from "../utils";


const KICK = gql`
  mutation Kick($feed: Int!, $room: Int!) {
    kick(feed: $feed, room: $room) {
      room
      feed
    }
  }
`;

const useKick = () => {
  const {
    pcMap,
    setPcMap,
    setVidMap,
  } = useContext(AppContext);

  const [kickFeed] = useMutation(KICK, {
    onError: err => {
      console.error(err);
    },
    onCompleted: ({ kick }) => {
      console.log(kick);
      if (kick.feed) {
        setVidMap(prev => {
          const newVidMap = { ...prev }
          delete newVidMap[kick.feed];
          return newVidMap;
        })
        closePC(pcMap, kick.feed, setPcMap);
      }
    },
  });

  const kick = (feed: number, room: number) => {
    kickFeed({ variables: { feed, room } });
  };

  return kick;
}

export default useKick;

