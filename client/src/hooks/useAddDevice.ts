import { gql, useMutation } from "@apollo/client"
import { Preferences } from "@capacitor/preferences";


const ADD_DEVICE = gql`
  mutation addDevice($apnsToken: String!) {
    addDevice(apnsToken: $apnsToken) {
      id
      apnsToken
    }
  }
`
const useAddDevice = () => {
  const [add] = useMutation(ADD_DEVICE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log('add device', data);
      Preferences.set({ key: 'deviceId', value: data.addDevice.id });
    },
  });

  const addDevice = (apnsToken: string) => { 
    add({ variables: { apnsToken } });
  }

  return addDevice;
}

export default useAddDevice;