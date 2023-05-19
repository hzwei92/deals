import { Preferences } from "@capacitor/preferences";
import { useIonRouter } from "@ionic/react";
import { useContext, useEffect } from "react";
import { AppContext } from "./App";
import { MOBILE_KEY } from "./constants";
import useToken from "./hooks/useToken";


const AppInitializer = () => {
  const router = useIonRouter();
  
  const { setMobile, setIsVerified } = useContext(AppContext);

  const { refreshToken } = useToken();

  useEffect(() => {
    const init = async () => {
      const { value } = await Preferences.get({ key: MOBILE_KEY });
      if (value) { 
        setMobile(value);
        setIsVerified(true);

        refreshToken();
      }
      else {
        setMobile('');
        setIsVerified(false);

        router.push('/login')
      }
    };

    init();
  }, []);

  return null;
};

export default AppInitializer;