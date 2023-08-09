import { gql, useMutation } from "@apollo/client"
import { useContext } from "react";
import { AppContext } from "../App";
import { useAppDispatch } from "../store";
import { addUsers, setAppUserId } from "../slices/userSlice";
import { Preferences } from "@capacitor/preferences";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";
import useToken from "./useToken";
import { USER_FIELDS } from "../fragments/user";

const FB_AUTH = gql`
  mutation FacebookAuth($credential: String!) {
    facebookAuth(credential: $credential) {
      user {
        ...UserFields
      }
      accessToken
      refreshToken
    }
  }
  ${USER_FIELDS}
`;
const useFacebookAuth = () => {
  const dispatch = useAppDispatch();

  const { authModal } = useContext(AppContext)

  const { refreshTokenInterval } = useToken();

  const [authenticate] = useMutation(FB_AUTH, {
    onError: (err) => {
      console.error(err);
    },
    onCompleted: async (data) => {
      console.log(data);
      if (data.facebookAuth.user.id) {
        authModal.current?.dismiss();

        dispatch(addUsers([data.facebookAuth.user]));
        dispatch(setAppUserId(data.facebookAuth.user.id));

        await Preferences.set({
          key: ACCESS_TOKEN_KEY,
          value: data.facebookAuth.accessToken,
        });
        
        await Preferences.set({
          key: REFRESH_TOKEN_KEY,
          value: data.facebookAuth.refreshToken,
        })

        refreshTokenInterval();
      }
    },
  });

  const facebookAuth = async (credential?: string) => {
    if (credential) {
      await authenticate({ variables: { credential } });
    }
  }

  return facebookAuth;
}

export default useFacebookAuth;