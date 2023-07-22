import { gql, useMutation } from "@apollo/client"

const CREATE = gql`
  mutation Create($channelId: Int!) {
    create(channelId: $channelId)
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

  const create = (channelId: number) => {
    createRoom({ variables: { channelId } });
  }

  return create;
}

export default useCreate;