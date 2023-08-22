import { IonAvatar, IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar, isPlatform, useIonRouter } from "@ionic/react"
import md5 from "md5";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { personCircleOutline } from "ionicons/icons";
import { localTracks } from "../hooks/useJanus";
import { selectActiveChannel } from "../slices/channelSlice";
import { useEffect } from "react";

const AppBar: React.FC = () => {
  const router = useIonRouter();

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectActiveChannel);

  useEffect(() => {
    const pattern = /\/map\/channel\/(\d+)$/;
    const match = router.routeInfo.pathname.match(pattern)
    if (match) {
      const id = match[1];
      router.push('/map/channel/' + id + '/talk');
    }
  }, [router.routeInfo.pathname]);

  const handleClick = () => {
    if (!channel) return;
    
    router.push('/map/channel/' + channel.id + '/talk')
  }
  return (
    <IonHeader>
      <IonToolbar style={{
        position: 'fixed',
        paddingTop: isPlatform('ios') ? 50 : 0,
      }}>
        <IonTitle size="large" slot='start'>JAMN</IonTitle>

        <IonButtons slot='end' style={{
          marginRight: 10,
        }}>
          {
            channel?.id
              ?  (
                <IonButton onClick={handleClick} color={'dark'} style={{
                  backgroundColor: 'green',
                  borderRadius: 10,
                  padding: 5,
                  whiteSpace: 'nowrap',
                  marginLeft: 'auto',
                }}>
                  { channel.name }
                </IonButton>
              )
              : null
          }
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