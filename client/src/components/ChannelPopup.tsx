import {IonButton, IonButtons, IonIcon, UseIonRouterResult } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../store";
import { selectAppUser } from "../slices/userSlice";
import { useState } from "react";
import ChannelPopupTalk from "./ChannelPopupTalk";
import { selectFocusChannel } from "../slices/channelSlice";
import ChannelPopupText from "./ChannelPopupText";
import ChannelPopupRoam from "./ChannelPopupRoam";
import { close, closeOutline, removeOutline, squareOutline, star, starOutline, stopOutline } from "ionicons/icons";
import { useSetMembershipSavedIndex } from "../hooks/useSetMembershipSavedIndex";
import { selectMembershipByChannelIdAndUserId } from "../slices/membershipSlice";

interface ChannelPopupProps {
  router: UseIonRouterResult;
  authModal: React.RefObject<HTMLIonModalElement>;
  streams: Record<number, any>;
}

const ChannelPopup: React.FC<ChannelPopupProps> = ({ router, authModal, streams }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);


  const membership = useAppSelector(state => selectMembershipByChannelIdAndUserId(state, channel?.id ?? -1, user?.id ?? -1))

  const [mode, setMode] = useState('talk');

  const setMembershipSavedIndex = useSetMembershipSavedIndex();

  const handleMinimizeClick = () => {
    if (!membership?.id) return;
    if (membership?.savedIndex === null) {
      setMembershipSavedIndex(membership.id, 0)
    }
    else {
      setMembershipSavedIndex(membership.id, null)
    }
  }

  const handleMaximizeClick = () => {
    router.push('/channel/' + channel?.id + '/' + mode, 'none');
  }

  const handleCloseClick = () => {
    router.push('/map', 'none');
  }

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
          <IonButton onClick={handleMinimizeClick}>
            <IonIcon icon={membership?.savedIndex === null ? starOutline : star} size="small" style={{
              color: membership?.savedIndex === null ? null : 'var(--ion-color-primary)'
            }}/>
          </IonButton>
          <IonButton onClick={handleMaximizeClick}>
            <IonIcon icon={stopOutline} size="small" />
          </IonButton>
          <IonButton onClick={handleCloseClick}>
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