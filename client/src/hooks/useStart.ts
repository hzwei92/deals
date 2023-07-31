import { gql, useMutation } from "@apollo/client";
import { useAppSelector } from "../store";
import { selectActiveChannel } from "../slices/channelSlice";

const START = gql`
  mutation Start($feed: Int! $jsep: JsepInput!) {
    start(feed: $feed, jsep: $jsep) {
      room
      feed
      started
    }
  }
`;

const useStart = () => {
  const channel = useAppSelector(selectActiveChannel);

  const [startFeed] = useMutation(START, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const start = (feed: number, jsep: any) => {
    if (!channel) return;
    startFeed({ variables: { feed, jsep } });
  }

  return start;
}

export default useStart;