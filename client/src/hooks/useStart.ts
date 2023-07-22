import { gql, useMutation } from "@apollo/client";
import { useAppSelector } from "../store";
import { selectActiveChannel } from "../slices/channelSlice";

const START = gql`
  mutation Start($feed: Float!, $channelId: Int! $jsep: JsepInput!) {
    start(feed: $feed, channelId: $channelId, jsep: $jsep)
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

  const start = (feed: string, jsep: any) => {
    if (!channel) return;
    startFeed({ variables: { feed, jsep, channelId: channel.id } });
  }

  return start;
}

export default useStart;