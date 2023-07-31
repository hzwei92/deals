import { gql, useMutation } from "@apollo/client";
import useDisconnect from "./useDisconnect";


const DESTROY = gql`
  mutation Destroy($room: Int!) {
    destroy(room: $room) {
      room
      permanent
    }
  }
`;

const useDestroy = () => {
  const disconnect = useDisconnect();

  const [destroyRoom] = useMutation(DESTROY, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      disconnect();
    },
  });

  const destroy = (room: number) => {
    destroyRoom({ variables: { room } });
  }

  return destroy;
};

export default useDestroy;