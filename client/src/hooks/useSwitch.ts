import { gql, useMutation } from "@apollo/client";

const SWITCH = gql`
  mutation Switch($to_feed: Int!, $audio: Boolean!, $video: Boolean!, $data: Boolean!) {
    switch(to_feed: $to_feed, audio: $audio, video: $video, data: $data) {
      room
      from_feed
      to_feed
      switched
      display
    }
  }
`;

const useSwitch = () => {
  const [switchFeed] = useMutation(SWITCH, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const switchTo = (to_feed: number, audio: boolean, video: boolean, data: boolean) => {
    switchFeed({ variables: { to_feed, audio, video, data } });
  }

  return switchTo;
}

export default useSwitch;