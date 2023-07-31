import { gql, useMutation } from "@apollo/client"

const DISCONNECT = gql`
  mutation Disconnect {
    disconnect
  }
`;

const useDisconnect = () => {
  const [dis] = useMutation(DISCONNECT, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const disconnect = () => {
    dis();
  }

  return disconnect;

};

export default useDisconnect;