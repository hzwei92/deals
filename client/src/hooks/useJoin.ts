import { gql, useMutation } from "@apollo/client";
import useOffer from "./useOffer";
import useConfigure from "./useConfigure";
import useSubscribe from "./useSubscribe";

const JOIN_ROOM = gql`
  mutation Join($room: Int!) {
    join(room: $room) {
      room
      feed
      display
      private_id
      publishers {
        feed
        display
        talking
        audiocodec
        videocodec
        simulcast
        streams {
          type
          mindex
          mid
          codec
          fec
        }
      }
      jsep {
        type
        sdp
      }
    }
  }
`;

const useJoin = () => {
  const doOffer = useOffer();
  const configure = useConfigure();
  const { subscribeTo } = useSubscribe();

  const [joinRoom] = useMutation(JOIN_ROOM, {
    onError: err => {
      console.error(err);
    },
    onCompleted: async ({ join }) => {
      console.log(join);
      try {
        const offer = await doOffer(join.feed, join.display);
        configure(join.room, offer, false, undefined, undefined);
        subscribeTo(join.publishers, join.room)
      } catch (err) {
        console.log('error while doing offer', err);
      }
    },
  });

  const join = (room: number) => {
    joinRoom({ variables: { room } });
  }

  return join;
}

export default useJoin;