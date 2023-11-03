import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAppDispatch } from '../store';
import { addUsers } from '../slices/userSlice';

const SET_USER_CAM = gql`
  mutation SetUserCam($isCamOn: Boolean!) {
    setUserCam(isCamOn: $isCamOn) {
      id
      isCamOn
    }
  }
`;

export function useSetUserCam() {
  const dispatch = useAppDispatch();

  const [setUserCamMutation] = useMutation(SET_USER_CAM, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(addUsers([data.setUserCam]));
    },
  });

  async function setUserCam(isCamOn: boolean) {
    setUserCamMutation({
      variables: {
        isCamOn,
      },
    });
  }

  return setUserCam;
}