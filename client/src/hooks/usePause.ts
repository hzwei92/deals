import { gql, useMutation } from "@apollo/client";


const PAUSE = gql`
  mutation Pause {
    pause {
      room
      feed
      paused
    }
  }
`;

const usePause = () => {
  const [pauseFeed] = useMutation(PAUSE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const pause = () => {
    pauseFeed();
  }

  return pause;
};

export default usePause;