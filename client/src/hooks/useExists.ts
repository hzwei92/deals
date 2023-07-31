import { gql, useMutation } from "@apollo/client"
import { useAppSelector } from "../store";
import { selectActiveChannel } from "../slices/channelSlice";
import useCreate from "./useCreate";

const EXISTS = gql`
  mutation Exists($room: Int!) {
    exists(room: $room) {
      room
      exists
    }
  }
`;

const useExists = () => {
  const channel = useAppSelector(selectActiveChannel);

  const create = useCreate();

  const [checkExists] = useMutation(EXISTS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: ({exists}) => {
      console.log(exists);
      if (channel && exists.room === channel.id && !exists.exists) {
        create(channel.id);
      }
    },
  });

  const exists = (room: number) => {
    checkExists({ variables: { room } });
  };

  return exists;
}

export default useExists;