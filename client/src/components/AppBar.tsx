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
      router.push('/channel/' + id + '/call');
    }
  }, [router.routeInfo.pathname]);

  const handleClick = () => {
    if (!channel) return;
    
    router.push('/channel/' + channel.id + '/call')
  }
  return (
      <IonHeader style={{
      }}>
        <div style={{
          backgroundColor: 'var(--ion-tab-bar-background, var(--ion-color-step-50, #f7f7f7))',
          width: '100%',
          height: 50,
          //paddingTop: isPlatform('ios') ? 50 : 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: 32,
            fontWeight: 'bold',
            padding: 5,
            paddingLeft: 10,
          }}>JAMN</div>

          <IonButtons style={{
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
        </div>

      </IonHeader>
  )
}

export default AppBar;