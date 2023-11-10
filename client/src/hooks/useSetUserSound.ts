import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAppDispatch } from '../store';
import { addUsers } from '../slices/userSlice';

const SET_USER_SOUND = gql`
  mutation SetUserSound($isSoundOn: Boolean!) {
    setUserSound(isSoundOn: $isSoundOn) {
      id
      isSoundOn
    }
  }
`;

export function useSetUserSound() {
  const dispatch = useAppDispatch();

  const [setUserSoundMutation] = useMutation(SET_USER_SOUND, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(addUsers([data.setUserSound]));
    },
  });

  async function setUserSound(isSoundOn: boolean) {
    setUserSoundMutation({
      variables: {
        isSoundOn,
      },
    });
  }

  return setUserSound;
}
