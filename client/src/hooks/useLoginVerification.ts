import { gql, useMutation } from "@apollo/client";
import { USER_FIELDS } from "../fragments/user";
import { useContext } from "react";
import { AppContext } from "../App";
import useToken from "./useToken";
import { useAppDispatch } from "../store";
import { addUsers, setAppUserId } from "../slices/userSlice";
import { Preferences } from "@capacitor/preferences";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";
import { User } from "../types/User";

const VERIFY = gql`
  mutation Verify($id: Int!, $code: String!) {
    verify(id: $id, code: $code) {
      user {
        ...UserFields
      }
      accessToken
      refreshToken
    }
  }
  ${USER_FIELDS}
`;

const useLoginVerification = (onError: (err: Error) => void, onCompleted: (user?: User) => void) => {
  const dispatch = useAppDispatch();

  const { authModal } = useContext(AppContext);

  const { refreshTokenInterval } = useToken()

  const [fetch] = useMutation(VERIFY, {
    onError: (err) => {
      console.log(err);
      onError(err);
    },
    onCompleted: async (data) => {
      console.log(data);
      if (data.verify.user.id) {
        
        authModal.current?.dismiss();
        
        dispatch(addUsers([data.verify.user]));
        dispatch(setAppUserId(data.verify.user.id));

        await Preferences.set({
          key: ACCESS_TOKEN_KEY,
          value: data.verify.accessToken,
        });
        
        await Preferences.set({
          key: REFRESH_TOKEN_KEY,
          value: data.verify.refreshToken,
        })

        refreshTokenInterval();
      }

      onCompleted(data.verify.user);
    },
  });

  const verify = (id: number, code: string) => {
    fetch({
      variables: {
        id,
        code,
      }
    });
  };

  return verify;
}

export default useLoginVerification