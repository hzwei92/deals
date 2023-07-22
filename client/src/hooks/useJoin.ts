import { gql, useMutation } from "@apollo/client";

const JOIN_ROOM = gql`
  mutation Join($channelId: Int!) {
    join(channelId: $channelId)
  }
`;

const useJoin = () => {
  const [joinRoom] = useMutation(JOIN_ROOM, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const join = (channelId: number) => {
    joinRoom({ variables: { channelId } });
  }

  return join;
}

export default useJoin;