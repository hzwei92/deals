import { IonAvatar, IonButton, IonButtons, IonHeader, IonIcon, useIonRouter } from "@ionic/react"
import md5 from "md5";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { micOffOutline, micOutline, personCircleOutline, videocamOffOutline, videocamOutline, volumeHighOutline, volumeMuteOutline } from "ionicons/icons";
import { selectActiveChannel } from "../slices/channelSlice";
import { useEffect, useState } from "react";

const AppBar: React.FC = () => {
  const router = useIonRouter();

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectActiveChannel);

  useEffect(() => {
    const pattern = /\/map\/channel\/(\d+)$/;
    const match = router.routeInfo.pathname.match(pattern)
    if (match) {
      const id = match[1];
      router.push('/channel/' + id + '/talk');
    }
  }, [router.routeInfo.pathname]);

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);

  const [callTime, setCallTime] = useState(0);

  const handleChannelClick = () => {
    if (!channel) return;
    if (router.routeInfo.pathname === '/channel/' + channel.id + '/talk') return;
    router.push('/channel/' + channel.id + '/talk')
  }

  useEffect(() => {
    if (channel?.id) {
      setCallTime(0);
      const interval = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
      return () => {
        clearInterval(interval);
      }
    }
  }, [channel?.id])
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
          <IonButtons>
            <IonButton>
              <img src={'/icon.png'} style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }} />
            </IonButton>
          </IonButtons>
          <IonButtons style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <IonButton onClick={handleChannelClick} style={{
              display: channel?.id ? 'block' : 'none',
              borderRadius: 5,
              minWidth: 60,
              backgroundColor: 'green',
              color: 'var(--ion-color-dark)',
              marginRight: 10,
            }}>
              { Math.floor(callTime  / 60 ).toString().padStart(2, '0') }:{ (callTime % 60).toString().padStart(2, '0') } 
            </IonButton>
            <IonButton onClick={() => setCamOn(prev => !prev)}style={{
              color: channel?.id && camOn ? 'green' : 'var(--ion-color-dark)',
              marginRight: 5,
            }}> 
            {
              camOn
                ? <IonIcon icon={videocamOutline} />
                : <IonIcon icon={videocamOffOutline} />
                
            }
            </IonButton>
            <IonButton onClick={() => setMicOn(prev => !prev)} style={{
              color: channel?.id && micOn ? 'green' : 'var(--ion-color-dark)',
              marginRight: 3,
            }}> 
            {
              micOn
                ? <IonIcon icon={micOutline} />
                : <IonIcon icon={micOffOutline} />

            }
            </IonButton>
            <IonButton onClick={() => setSpeakerOn(prev => !prev)} style={{
              color: channel?.id && speakerOn ? 'green' : 'var(--ion-color-dark)',
              marginRight: 10,
            }}> 
            {
              speakerOn 
                ? <IonIcon icon={volumeHighOutline} />
                : <IonIcon icon={volumeMuteOutline} />
            }
            </IonButton>
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