import { IonAvatar, IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar, isPlatform } from "@ionic/react"
import md5 from "md5";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { personCircleOutline } from "ionicons/icons";

const AppBar: React.FC = () => {
  const user = useAppSelector(selectAppUser);
  return (
    <IonHeader>
      <IonToolbar style={{
        position: 'fixed',
        paddingTop: isPlatform('ios') ? 50 : 0,
      }}>
        <IonTitle size="large">JAMN</IonTitle>
        <IonButtons slot='end' style={{
          marginRight: 10,
        }}>
          <IonButton id='auth-modal-button' style={{
            display: user?.id ? 'none' : 'block',
          }}>
            <IonIcon icon={personCircleOutline} />
          </IonButton>
          <IonButton id='account-modal-button' style={{
            display: user?.id ? 'block' : 'none',
          }}>
            <IonAvatar style={{
              width: 30,
              height: 30,
              cursor: 'pointer',
            }}>
              <img src={`https://www.gravatar.com/avatar/${md5(user?.id.toString() || '')}?d=retro`} />
            </IonAvatar>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>

  )
}

export default AppBar;