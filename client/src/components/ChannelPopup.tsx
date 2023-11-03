import {IonButton, IonButtons, IonIcon, UseIonRouterResult } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../store";
import { selectAppUser } from "../slices/userSlice";
import { useState } from "react";
import ChannelPopupTalk from "./ChannelPopupTalk";
import { selectFocusChannel } from "../slices/channelSlice";
import ChannelPopupText from "./ChannelPopupText";
import ChannelPopupRoam from "./ChannelPopupRoam";
import { close, closeOutline, removeOutline, squareOutline } from "ionicons/icons";

interface ChannelPopupProps {
  router: UseIonRouterResult;
  authModal: React.RefObject<HTMLIonModalElement>;
  streams: Record<number, any>;
}

const ChannelPopup: React.FC<ChannelPopupProps> = ({ router, authModal, streams }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  console.log('channel', channel)

  const [mode, setMode] = useState('talk');

  return (
    <div className="popup" style={{
    }}>
      <div style={{
        marginTop: 5,
        fontSize: 24,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        { channel?.name } 
        </div>
        <IonButtons style={{
        }}>
          <IonButton>
            <IonIcon icon={removeOutline} size="small" />
          </IonButton>
          <IonButton>
            <IonIcon icon={squareOutline} size="small" />
          </IonButton>
          <IonButton>
            <IonIcon icon={closeOutline} size="small"/>
          </IonButton>
        </IonButtons>
      </div>
      <div style={{
        marginTop: 10,
        textAlign: 'left',
        fontSize: 14,
        color: 'var(--ion-color-medium)'
      }}>
        { channel?.detail }
      </div>
      <IonButtons style={{
        marginTop: 5,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <IonButton onClick={() => setMode('talk')} style={{
          color: mode === 'talk' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: mode === 'talk' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          TALK
        </IonButton>
        <IonButton onClick={() => setMode('text')} style={{
          color: mode === 'text' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: mode === 'text' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          TEXT
        </IonButton>
        <IonButton onClick={() => setMode('roam')} style={{
          color: mode === 'roam' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: mode === 'roam' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          ROAM
        </IonButton>
      </IonButtons>
      <div style={{
        marginTop: 10,
      }}>
        {
          mode === 'talk'
            ? <ChannelPopupTalk authModal={authModal} streams={streams} />
            : mode === 'text'
              ? <ChannelPopupText />
              : mode === 'roam'
                ? <ChannelPopupRoam />
                : null
        }
      </div>
    </div>
  )
}


export default ChannelPopup;