import {IonButton, IonButtons, IonIcon, UseIonRouterResult } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../store";
import { selectAppUser } from "../slices/userSlice";
import { Dispatch, SetStateAction, useState } from "react";
import ChannelPopupTalk from "./ChannelTalk";
import { selectFocusChannel } from "../slices/channelSlice";
import ChannelPopupText from "./ChannelText";
import ChannelPopupRoam from "./ChannelRoam";
import { close, closeOutline, removeOutline, squareOutline, star, starOutline, stopOutline } from "ionicons/icons";
import { useSetMembershipSavedIndex } from "../hooks/useSetMembershipSavedIndex";
import { selectMembershipByChannelIdAndUserId } from "../slices/membershipSlice";
import { AppContext } from "../App";

interface ChannelPopupProps {
  router: UseIonRouterResult;
  authModal: React.RefObject<HTMLIonModalElement>;
  streams: Record<number, any>;
  channelMode: 'talk' | 'text' | 'roam';
  setChannelMode: Dispatch<SetStateAction<'talk' | 'text' | 'roam'>>;
}

const ChannelPopup: React.FC<ChannelPopupProps> = ({ router, authModal, streams, channelMode, setChannelMode }) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  const membership = useAppSelector(state => selectMembershipByChannelIdAndUserId(state, channel?.id ?? -1, user?.id ?? -1))

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
    router.push('/channel/' + channel?.id, 'none');
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
            <IonIcon icon={!membership?.id || membership?.savedIndex === null ? starOutline : star} size="small" style={{
              color:!membership?.id || membership?.savedIndex === null ? null : 'var(--ion-color-primary)'
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
        <IonButton onClick={() => setChannelMode('talk')} style={{
          color: channelMode === 'talk' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: channelMode === 'talk' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          TALK
        </IonButton>
        <IonButton onClick={() => setChannelMode('text')} style={{
          color: channelMode === 'text' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: channelMode === 'text' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          TEXT
        </IonButton>
        <IonButton onClick={() => setChannelMode('roam')} style={{
          color: channelMode === 'roam' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: channelMode === 'roam' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          ROAM
        </IonButton>
      </IonButtons>
      <div style={{
        marginTop: 10,
      }}>
        {
          channelMode === 'talk'
            ? <ChannelPopupTalk authModal={authModal} streams={streams} />
            : channelMode === 'text'
              ? <ChannelPopupText />
              : channelMode === 'roam'
                ? <ChannelPopupRoam />
                : null
        }
      </div>
    </div>
  )
}


export default ChannelPopup;