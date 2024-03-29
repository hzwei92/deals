import { IonAvatar, IonButton, IonButtons, IonHeader, IonIcon, isPlatform, useIonRouter } from "@ionic/react"
import md5 from "md5";
import { selectAppUser } from "../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../store";
import { micOffOutline, micOutline, personCircleOutline, videocamOffOutline, videocamOutline, volumeHighOutline, volumeMuteOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useSetUserCam } from "../hooks/useSetUserCam";
import { useSetUserMic } from "../hooks/useSetUserMic";
import { selectFocusChannel } from "../slices/channelSlice";
import { useSetUserSound } from "../hooks/useSetUserSound";

const AppBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  const [callTime, setCallTime] = useState(0);

  const handleChannelClick = () => {
    if (user?.activeChannelId && user.activeChannelId !== channel?.id) {
      if (
        router.routeInfo.pathname !== '/channel/' + user.activeChannelId ||
        router.routeInfo.pathname !== '/map/' + user.activeChannelId
      ) {
        router.push('/map/' + user.activeChannelId, 'none');
      } 
    };
  }

  useEffect(() => {
    if (user?.activeChannelId) {
      setCallTime(0);
      const interval = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
      return () => {
        clearInterval(interval);
      }
    }
  }, [user?.activeChannelId]);

  const setUserCam = useSetUserCam();
  const setUserMic = useSetUserMic();
  const setUserSound = useSetUserSound();

  const handleCamClick = () => {
    if (!user?.id) return;
    setUserCam(!user.isCamOn);
  }

  const handleMicClick = () => {
    if (!user) return;
    setUserMic(!user.isMicOn);
  }

  const handleSoundClick = () => {
    if (!user) return;
    setUserSound(!user.isSoundOn);
  }

  return (
      <IonHeader style={{
      }}>
        <div style={{
          backgroundColor: 'var(--ion-tab-bar-background, var(--ion-color-step-50, #f7f7f7))',
          width: '100%',
          height: isPlatform('ios') && !isPlatform('mobileweb') ? 100 : 50,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <IonButtons style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            paddingBottom: 10,
          }}>
            <IonButton>
              <img src={'/JAMN.png'} style={{
                width: 30,
                height: 30,
                borderRadius: 20,
                backgroundColor: 'var(--ion-tab-bar-background, var(--ion-color-step-50, #f7f7f7))',
              }} />
            </IonButton>
          </IonButtons>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            paddingBottom: 10,
          }}>
          <IonButtons style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <IonButton onClick={handleChannelClick} style={{
              display: user?.activeChannelId ? 'block' : 'none',
              borderRadius: 5,
              minWidth: 60,
              backgroundColor: 'green',
              color: 'var(--ion-color-dark)',
              marginRight: 10,
            }}>
              { Math.floor(callTime  / 60 ).toString().padStart(2, '0') }:{ (callTime % 60).toString().padStart(2, '0') } 
            </IonButton>
            <IonButton onClick={handleCamClick}style={{
              display: user?.id ? 'block' : 'none',
              color: user?.activeChannelId && user?.isCamOn ? 'green' : 'var(--ion-color-dark)',
              marginRight: 5,
            }}> 
            {
              user?.isCamOn
                ? <IonIcon icon={videocamOutline} />
                : <IonIcon icon={videocamOffOutline} />
                
            }
            </IonButton>
            <IonButton onClick={handleMicClick} style={{
              display: user?.id ? 'block' : 'none',
              color: user?.activeChannelId && user?.isMicOn ? 'green' : 'var(--ion-color-dark)',
              marginRight: 3,
            }}> 
            {
              user?.isMicOn
                ? <IonIcon icon={micOutline} />
                : <IonIcon icon={micOffOutline} />

            }
            </IonButton>
            <IonButton onClick={handleSoundClick} style={{
              display: user?.id ? 'block' : 'none',
              color: user?.activeChannelId && user?.isSoundOn ? 'green' : 'var(--ion-color-dark)',
              marginRight: 10,
            }}> 
            {
              user?.isSoundOn 
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
                <img src={`https://www.gravatar.com/avatar/${md5(user?.email || '')}?d=retro`} />
              </IonAvatar>
            </IonButton>
          </IonButtons>
          </div>
        </div>

      </IonHeader>
  )
}

export default AppBar;