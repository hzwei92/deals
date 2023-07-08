import { gql, useMutation } from "@apollo/client";
import { Preferences } from "@capacitor/preferences";
import { ACCESS_TOKEN_KEY, REFRESH_ACCESS_TOKEN_TIME, REFRESH_TOKEN_KEY } from "../constants";
import { selectInterval, setIsInitialized, setRefreshInterval } from "../slices/authSlice";
import { addUsers, setAppUserId } from "../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../store";

const REFRESH_TOKEN = gql`
  mutation Refresh($refreshToken: String!) {
    refresh(refreshToken: $refreshToken) {
      user {
        id
        phone
        isAdmin
      }
      accessToken
    }
  }
`;

export default function useToken() {
  const dispatch = useAppDispatch();
  const interval = useAppSelector(selectInterval);

  const [refresh] = useMutation(REFRESH_TOKEN, {
    onError: err => {
      console.log(err);
      if (interval) {
        clearInterval(interval);
      }
      dispatch(setIsInitialized(true));
      dispatch(setRefreshInterval(null));
      dispatch(setAppUserId(null));
    },
    onCompleted: data => {
      console.log(data);
      dispatch(setIsInitialized(true));
      dispatch(addUsers([data.refresh.user]));
      dispatch(setAppUserId(data.refresh.user.id));
      Preferences.set({
        key: ACCESS_TOKEN_KEY,
        value: data.refresh.accessToken,
      });
    }
  });
  
  const refreshToken = async () => {
    const { value } = await Preferences.get({ key: REFRESH_TOKEN_KEY });
    if (value) {
      refresh({ variables: { refreshToken: value } });
    }
    else {
      dispatch(setIsInitialized(true));
      dispatch(setRefreshInterval(null));
      dispatch(setAppUserId(null));
    }
  };

  const refreshTokenInterval = () => {
    const interval = setInterval(refreshToken, REFRESH_ACCESS_TOKEN_TIME);
    dispatch(setRefreshInterval(interval));
  };

  return { refreshToken, refreshTokenInterval }
}