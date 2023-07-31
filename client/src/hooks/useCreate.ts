import { gql, useMutation } from "@apollo/client"

const CREATE = gql`
  mutation Create($room: Int!) {
    create(room: $room) {
      room
      permanent
    }
  }
`;

const useCreate = () => {
  const [createRoom] = useMutation(CREATE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const create = (room: number) => {
    createRoom({ variables: { room } });
  }

  return create;
}

export default useCreate;