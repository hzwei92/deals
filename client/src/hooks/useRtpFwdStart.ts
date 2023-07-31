import { gql, useMutation } from "@apollo/client";


const RTP_FWD_START = gql`
  mutation RtpFwdStart($room: Int!, $feed: Int!, $host: String!) {
    rtpFwdStart(room: $room, feed: $feed, host: $host) {
      room
      forwarder {
        host
        audio_port
        audio_rtcp_port
        audio_stream
        video_port
        video_rtcp_port
        video_stream
        data_port
        data_stream
        ssrc
        pt
        sc_substream_layer
        srtp
      }
    }
  }
`;

const useRtpFwdStart = () => {
  const [start] = useMutation(RTP_FWD_START, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const rtpFwdStart = (room: number, feed: number, host: string) => {
    start({ variables: { room, feed, host } });
  }

  return rtpFwdStart;
};

export default useRtpFwdStart;