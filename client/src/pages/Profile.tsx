import { Preferences } from "@capacitor/preferences";
import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { homeOutline } from "ionicons/icons";
import { useContext } from "react";
import { AppContext } from "../App";
import { MOBILE_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";

const Profile: React.FC = () => {
  const { 
    mobile, 
    setMobile, 
    setIsVerified,
    tokenRefreshInterval,
    setTokenRefreshInterval,
  } = useContext(AppContext);

  const onLogout = () => {
    Preferences.remove({ key: MOBILE_KEY })
    Preferences.remove({ key: ACCESS_TOKEN_KEY });
    Preferences.remove({ key: REFRESH_TOKEN_KEY });

    setMobile('');
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
            +1 {mobile.slice(0, 3)} {mobile.slice(3, 6)} {mobile.slice(6, 10)}
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