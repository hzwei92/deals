import { gql, useMutation } from "@apollo/client"
import { Preferences } from "@capacitor/preferences";


const ADD_DEVICE = gql`
  mutation addDevice($apnToken: String!) {
    addDevice(apnToken: $apnToken) {
      id
      apnToken
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

  const addDevice = (apnToken: string) => { 
    add({ variables: { apnToken } });
  }

  return addDevice;
}

export default useAddDevice;