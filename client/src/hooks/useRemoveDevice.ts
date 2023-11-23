import { gql, useMutation } from "@apollo/client";
import { Preferences } from "@capacitor/preferences";


const REMOVE_DEVICE = gql`
  mutation RemoveDevice($deviceId: Int!) {
    removeDevice(deviceId: $deviceId)
  }
`;

const useRemoveDevice = () => {
  const [remove] = useMutation(REMOVE_DEVICE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log('remove device', data);
    },
  });

  const removeDevice = (deviceId: number) => { 
    Preferences
      .get({ key: 'deviceId' })
      .then(({ value }) => {
        remove({ variables: { 
          deviceId: value,
        } });
      });
  }

  return removeDevice;
}

export default useRemoveDevice;