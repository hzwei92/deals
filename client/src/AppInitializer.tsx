import { Preferences } from "@capacitor/preferences";
import { useIonRouter } from "@ionic/react";
import { useContext, useEffect } from "react";
import { AppContext } from "./App";
import { PHONE_KEY } from "./constants";
import useToken from "./hooks/useToken";


const AppInitializer = () => {
  const router = useIonRouter();
  
  const { setPhone, setIsVerified } = useContext(AppContext);

  const { refreshToken } = useToken();

  useEffect(() => {
    const init = async () => {
      const { value } = await Preferences.get({ key: PHONE_KEY });
      if (value) { 
        setPhone(value);
        setIsVerified(true);

        refreshToken();
      }
      else {
        setPhone('');
        setIsVerified(false);

        router.push('/login')
      }
    };

    init();
  }, []);

  return null;
};

export default AppInitializer;