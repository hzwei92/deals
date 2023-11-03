import { IonAvatar, IonButton, IonButtons, IonHeader, IonIcon, useIonRouter } from "@ionic/react"
import md5 from "md5";
import { selectAppUser } from "../slices/userSlice";
import { useAppDispatch, useAppSelector } from "../store";
import { micOffOutline, micOutline, personCircleOutline, videocamOffOutline, videocamOutline, volumeHighOutline, volumeMuteOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useSetUserCam } from "../hooks/useSetUserCam";
import { useSetUserMic } from "../hooks/useSetUserMic";
import { selectFocusChannel, setFocusChannelId } from "../slices/channelSlice";

const AppBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useIonRouter();

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  const [callTime, setCallTime] = useState(0);

  const handleChannelClick = () => {
    if (user?.activeChannelId && channel?.id && user.activeChannelId !== channel.id) {
      router.push('/channel/' + user.activeChannelId + '/talk')
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

  const handleCamClick = () => {
    if (!user?.id) return;
    setUserCam(!user.isCamOn);
  }

  const handleMicClick = () => {
    if (!user) return;
    setUserMic(!user.isMicOn);
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
            <IonButton onClick={() => {}} style={{
              display: user?.id ? 'block' : 'none',
              color: user?.activeChannelId && true ? 'green' : 'var(--ion-color-dark)',
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
                <img src={`https://www.gravatar.com/avatar/${md5(user?.id.toString() || '')}?d=retro`} />
              </IonAvatar>
            </IonButton>
          </IonButtons>
        </div>

      </IonHeader>
  )
}

export default AppBar;