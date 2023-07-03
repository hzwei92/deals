import { Preferences } from "@capacitor/preferences";
import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { homeOutline } from "ionicons/icons";
import { useContext } from "react";
import { AppContext } from "../App";
import { PHONE_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";

const Profile: React.FC = () => {
  const { 
    phone, 
    setPhone, 
    setIsVerified,
    tokenRefreshInterval,
    setTokenRefreshInterval,
  } = useContext(AppContext);

  const onLogout = () => {
    Preferences.remove({ key: PHONE_KEY })
    Preferences.remove({ key: ACCESS_TOKEN_KEY });
    Preferences.remove({ key: REFRESH_TOKEN_KEY });

    setPhone('');
    setIsVerified(false);

    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      setTokenRefreshInterval(null);
    }
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
            +1 {phone.slice(0, 3)} {phone.slice(3, 6)} {phone.slice(6, 10)}
          </div>
          <div>
            <IonButton routerLink='/login' onClick={onLogout}>
              Logout
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Profile;