import { gql, useMutation } from "@apollo/client";
import { Preferences } from "@capacitor/preferences";
import { useIonRouter } from "@ionic/react";
import { useContext } from "react";
import { AppContext } from "../App";
import { ACCESS_TOKEN_KEY, REFRESH_ACCESS_TOKEN_TIME, REFRESH_TOKEN_KEY } from "../constants";

const REFRESH_TOKEN = gql`
  mutation Refresh($refreshToken: String!) {
    refresh(refreshToken: $refreshToken)
  }
`;

export default function useToken() {
  const router = useIonRouter();

  const { setMobile, setIsVerified, setTokenRefreshInterval } = useContext(AppContext);

  const [refresh] = useMutation(REFRESH_TOKEN, {
    onError: err => {
      console.log(err);
      setMobile('');
      setIsVerified(false);
    },
    onCompleted: data => {
      console.log(data);

      if (data.refreshToken) {
        Preferences.set({
          key: ACCESS_TOKEN_KEY,
          value: data.refreshToken,
        });
      }
    }
  });
  
  const refreshToken = async () => {
    const { value } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
    if (value) {
      refresh({ variables: { refreshToken: value } });
    }
    else {
      setMobile('');
      setIsVerified(false);
      router.push('/login')
    }
  };

  const refreshTokenInterval = () => {
    const interval = setInterval(refreshToken, REFRESH_ACCESS_TOKEN_TIME);
    setTokenRefreshInterval(interval);
  };

  return { refreshToken, refreshTokenInterval }
}