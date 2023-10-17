import { gql, useMutation } from "@apollo/client";


const LOGOUT = gql`
  mutation Logout {
    logout
  }
`

const useLogout = () => {
  const [fetch] = useMutation(LOGOUT, {
    onError: (error) => {
      console.log(error);
    },
    onCompleted: (data) => {
      console.log(data)
    },
  });

  const logout = () => {
    fetch();
  }

  return logout;
};


export default useLogout;