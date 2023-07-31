import { gql, useMutation } from "@apollo/client";

const RTP_FWD_LIST = gql`
  mutation RtpFwdList($room: Int!) {
    rtpFwdList(room: $room) {
      room
      forwarders {
        feed 
        forwarders {
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
  }
`;

const useRtpFwdList = () => {
  const [list] = useMutation(RTP_FWD_LIST, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const rtpFwdList = (room: number) => {
    list({ variables: { room } });
  }

  return rtpFwdList;
};

export default useRtpFwdList;