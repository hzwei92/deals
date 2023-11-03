import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAppDispatch } from '../store';
import { addUsers } from '../slices/userSlice';

const SET_USER_MIC = gql`
  mutation SetUserMic($isMicOn: Boolean!) {
    setUserMic(isMicOn: $isMicOn) {
      id
      isMicOn
    }
  }
`;

export function useSetUserMic() {
  const dispatch = useAppDispatch();

  const [setUserMicMutation] = useMutation(SET_USER_MIC, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(addUsers([data.setUserMic]));
    },
  });

  async function setUserMic(isMicOn: boolean) {
    setUserMicMutation({
      variables: {
        isMicOn,
      },
    });
  }

  return setUserMic;
}
