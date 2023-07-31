import { gql, useMutation } from "@apollo/client";

const LIST_ROOMS = gql`
  mutation ListRooms {
    listRooms {
      list {
        room
        description
        pin_required
        is_private
        max_publishers
        bitrate
        fir_freq
        require_pvtid
        require_e2ee
        dummy_publisher
        audiocodec
        videocodec
        opus_fec
        record
        lock_record
        num_participants
        audiolevel_ext
        audiolevel_event
        videoorient_ext
        playoutdelay_ext
        transport_wide_cc_ext
      }
    }
  }
`;
const useListRooms = () => {
  const [list] = useMutation(LIST_ROOMS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const listRooms = () => {
    list();
  };

  return listRooms;
}

export default useListRooms;