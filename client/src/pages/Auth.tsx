import { IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";
import { useContext, useEffect } from "react";
import { AppContext } from "../App";
import Login from "../components/Login";
import Verify from "../components/Verify";

const Auth: React.FC = () => {
  const router = useIonRouter();

  const { mobile, isVerified } = useContext(AppContext);

  useEffect(() => {
    if (mobile && isVerified) {
      router.push('/home');
    }
  }, [mobile, isVerified])
  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      {
        !mobile 
          ? <Login />
          : !isVerified
            ? <Verify />
            : null
      }
    </IonPage>
  );
}

export default Auth;