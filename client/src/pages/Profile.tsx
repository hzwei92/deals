import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { homeOutline } from "ionicons/icons";
import { useContext } from "react";
import { AppContext } from "../App";

const Profile: React.FC = () => {
  const { 
    mobile, 
    setMobile, 
    isVerified,
    setIsVerified,
  } = useContext(AppContext);

  const onLogout = () => {
    setMobile('');
    setIsVerified(false);
  }
  
  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonButton routerLink='/home' slot='start'>
            <IonIcon icon={homeOutline}></IonIcon>
          </IonButton>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{
          padding: 10,
        }}>
          Mobile number:
          <div style={{
            padding:10,
          }}>
            +1 {mobile.slice(0, 3)} {mobile.slice(3, 6)} {mobile.slice(6, 10)}
          </div>
          <div>
            <IonButton routerLink='/start' onClick={onLogout}>
              Logout
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Profile;