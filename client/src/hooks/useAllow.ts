import { gql, useMutation } from "@apollo/client";

const ALLOW = gql`
  mutation Allow($room: Int!, $action: String!) {
    allow(room: $room, action: $action) {
      list
    }
  }
`;

const useAllow = () => {
  const [allowAction] = useMutation(ALLOW, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const allow = (room: number, action: string) => {
    allowAction({ variables: { room, action } });
  }

  return allow;
};

export default useAllow;