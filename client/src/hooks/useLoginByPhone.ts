import { gql, useMutation } from "@apollo/client";
import { USER_FIELDS } from "../fragments/user";
import { User } from "../types/User";

const PHONE_LOGIN = gql`
  mutation phoneLogin($phone: String!) {
    phoneLogin(phone: $phone) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

const useLoginByPhone = (onCompleted: (user: User) => void) => {
  const [login] = useMutation(PHONE_LOGIN, {
    onError: error => {
      console.log(error);
    },
    onCompleted: data => {
      console.log(data);
      onCompleted(data.phoneLogin);
    },
  });

  const phoneLogin = (phone: string) => {
    login({
      variables: {
        phone,
      }
    });
  }

  return phoneLogin;
}

export default useLoginByPhone;