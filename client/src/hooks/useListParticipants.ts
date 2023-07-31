import { gql, useMutation } from "@apollo/client"

const LIST_PARTICIPANTS = gql`
  mutation ListParticipants($room: Int!) {
    listParticipants(room: $room) {
      room
      feed
      participants {
        feed
        display
        publisher
        talking
      }
    }
  }
`;
const useListParticipants = () => {
  const [list] = useMutation(LIST_PARTICIPANTS, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  })

  const listParticipants = (room: number) => {
    list({ variables: { room } });
  };

  return listParticipants;
}

export default useListParticipants;