import { IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { useContext } from "react";
import { AppContext } from "../App";
import Login from "../components/Login";
import Verify from "../components/Verify";

const Start: React.FC = () => {
  const { mobile, isVerified } = useContext(AppContext);
  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Start</IonTitle>
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

export default Start;