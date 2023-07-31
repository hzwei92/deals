import { gql, useMutation } from "@apollo/client";


const RTP_FWD_STOP = gql`
  mutation RtpFwdStop($room: Int!, $feed: Int!, $stream: Int!) {
    rtpFwdStop(room: $room, feed: $feed, stream: $stream) {
      room
      feed
      stream
    }
  }
`;

const useRtpFwdStop = () => {
  const [stop] = useMutation(RTP_FWD_STOP, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const rtpFwdStop = (room: number, feed: number, stream: number) => {
    stop({ variables: { room, feed, stream } });
  }

  return rtpFwdStop;
};

export default useRtpFwdStop;