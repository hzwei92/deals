import { gql, useMutation } from "@apollo/client";
import { USER_FIELDS } from "../fragments/user";
import { User } from "../types/User";

const EMAIL_LOGIN = gql`
  mutation emailLogin($email: String!) {
    emailLogin(email: $email) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

const useLoginByEmail = (onCompleted: (user: User) => void) => {
  const [login] = useMutation(EMAIL_LOGIN, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      onCompleted(data.emailLogin);
    },
  });

  const loginByEmail = (email: string) => {
    login({
      variables: {
        email,
      }
    });
  };

  return loginByEmail;
}

export default useLoginByEmail