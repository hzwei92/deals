import { gql, useMutation } from "@apollo/client"
import { Preferences } from "@capacitor/preferences";
import { DEVICE_ID_KEY } from "../constants";


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
      console.log('add device', data, data.addDevice.id);
      Preferences.set({ 
        key: DEVICE_ID_KEY, 
        value: data.addDevice.id.toString(),
      });
    },
  });

  const addDevice = (apnToken: string) => { 
    add({ variables: { apnToken } });
  }

  return addDevice;
}

export default useAddDevice;