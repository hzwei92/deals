import { gql, useMutation } from "@apollo/client";
import useOffer from "./useOffer";
import useConfigure from "./useConfigure";
import useSubscribe from "./useSubscribe";

const JOIN_ROOM = gql`
  mutation Join($channelId: Int!) {
    join(channelId: $channelId) {
      feed
      room
      display
      publishers {
        feed
        display
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
        configure(join.room, join.feed, offer, false, undefined, undefined);
        subscribeTo(join.publishers, join.room)
      } catch (err) {
        console.log('error while doing offer', err);
      }
    },
  });

  const join = (channelId: number) => {
    joinRoom({ variables: { channelId } });
  }

  return join;
}

export default useJoin;