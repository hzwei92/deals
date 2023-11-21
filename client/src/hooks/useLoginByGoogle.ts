import { gql, useMutation } from "@apollo/client"
import { useContext } from "react";
import { AppContext } from "../App";
import { useAppDispatch } from "../store";
import { addUsers, setAppUserId } from "../slices/userSlice";
import { Preferences } from "@capacitor/preferences";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";
import useToken from "./useToken";
import { USER_FIELDS } from "../fragments/user";
import { isPlatform } from "@ionic/react";

const GOOGLE_AUTH = gql`
  mutation GoogleAuth($credential: String!, $ios: Boolean!) {
    googleAuth(credential: $credential, ios: $ios) {
      user {
        ...UserFields
      }
      accessToken
      refreshToken
    }
  }
  ${USER_FIELDS}
`;
const useLoginByGoogle = () => {
  const dispatch = useAppDispatch();

  const { authModal } = useContext(AppContext)

  const { refreshTokenInterval } = useToken();

  const [authenticate] = useMutation(GOOGLE_AUTH, {
    onError: (err) => {
      console.error(err);
    },
    onCompleted: async (data) => {
      console.log(data);
      if (data.googleAuth.user.id) {
        authModal.current?.dismiss();

        dispatch(addUsers([data.googleAuth.user]));
        dispatch(setAppUserId(data.googleAuth.user.id));

        await Preferences.set({
          key: ACCESS_TOKEN_KEY,
          value: data.googleAuth.accessToken,
        });
        
        await Preferences.set({
          key: REFRESH_TOKEN_KEY,
          value: data.googleAuth.refreshToken,
        })

        refreshTokenInterval();
      }
    },
  });

  const googleAuth = (credential?: string) => {
    if (credential) {
      authenticate({ variables: { 
        credential,
        ios: isPlatform('ios') && !isPlatform('mobileweb'),
      } });
    }
  }

  return googleAuth;
}

export default useLoginByGoogle;