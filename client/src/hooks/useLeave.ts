import { gql, useMutation } from "@apollo/client";

const LEAVE_ROOM = gql`
  mutation Leave {
    leave
  }
`;

const useLeave = () => {
  const [leaveRoom] = useMutation(LEAVE_ROOM, {
    onError: err => {
      console.error(err);
    },
    onCompleted: async ({ leave }) => {
      console.log(leave);
    },
  });
  const leave = () => {
    leaveRoom();
  }

  return leave;
}

export default useLeave;