import {IonAvatar, IonButton, IonButtons, IonIcon, UseIonRouterResult } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../store";
import { selectAppUser, selectUsers } from "../slices/userSlice";
import { Dispatch, SetStateAction } from "react";
import ChannelPopupTalk from "./ChannelTalk";
import { selectFocusChannel } from "../slices/channelSlice";
import ChannelPopupText from "./ChannelText";
import ChannelPopupRoam from "./ChannelRoam";
import { closeOutline, star, starOutline, stopOutline } from "ionicons/icons";
import { useSaveMembership } from "../hooks/useSaveMembership";
import { selectMembershipByChannelIdAndUserId, selectMembershipsByChannelId } from "../slices/membershipSlice";
import md5 from "md5";

interface ChannelPopupProps {
  router: UseIonRouterResult;
  authModal: React.RefObject<HTMLIonModalElement>;
  streams: Record<number, any>;
  channelMode: 'talk' | 'text' | 'roam';
  setChannelMode: Dispatch<SetStateAction<'talk' | 'text' | 'roam'>>;
}

const ChannelPopup: React.FC<ChannelPopupProps> = ({ router, authModal, streams, channelMode, setChannelMode }) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);
  const memberships = useAppSelector(state => selectMembershipsByChannelId(state, channel?.id ?? -1));
  const membership = useAppSelector(state => selectMembershipByChannelIdAndUserId(state, channel?.id ?? -1, user?.id ?? -1))
  
  const owner = memberships.find(m => m.isOwner);
  console.log(owner, users, memberships);

  const saveMembership = useSaveMembership();

  const handleMinimizeClick = () => {
    if (!membership?.id || membership.isOwner) return;
    saveMembership(membership.id, !membership.isSaved);
  }

  const handleMaximizeClick = () => {
    router.push('/channel/' + channel?.id, 'none');
  }

  const handleCloseClick = () => {
    router.push('/map', 'none');
  }

  return (
    <div className="popup" style={{
      width: 220,
    }}>
      <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginLeft: -5,
        marginRight: -5,
      }}>
        <IonButtons>
          <IonButton onClick={handleMinimizeClick} style={{
          }}>
            <IonIcon icon={membership?.isSaved || membership?.isOwner ? star : starOutline } size="small" style={{
              color: membership?.isSaved || membership?.isOwner ? 'var(--ion-color-primary)' : null
            }}/>
          </IonButton>
        </IonButtons>
        <IonButtons>
          <IonButton onClick={handleMaximizeClick}>
            <IonIcon icon={stopOutline} size="small" />
          </IonButton>
          <IonButton onClick={handleCloseClick}>
            <IonIcon icon={closeOutline} size="small"/>
          </IonButton>
        </IonButtons>
      </div>
      <div style={{
        marginTop: 2,
        textAlign: 'left',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'var(--ion-color-dark)'
      }}>
        { channel?.name } 
      </div>
      <div style={{
        marginTop: 5,
        display: owner?.userId ? 'flex' : 'none',
        color: 'var(--ion-color-medium)',
        fontSize: 14,
      }}>
        <IonAvatar style={{
          width: 15,
          height: 15,
          marginTop: 2,
          marginRight: 2,
        }}>
          <img src={`https://www.gravatar.com/avatar/${md5(users[owner?.userId ?? -1]?.email ?? '')}?d=retro`} />
        </IonAvatar>
        {
          users[owner?.userId ?? -1]?.name
        }
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
      </div>
      <div style={{
        marginTop: 10,
        height: 300,
      }}>
        {
          channelMode === 'talk'
            ? <ChannelPopupTalk authModal={authModal} streams={streams} />
            : channelMode === 'text'
              ? <ChannelPopupText isPopup={true} />
              : channelMode === 'roam'
                ? <ChannelPopupRoam />
                : null
        }
      </div>
    </div>
  )
}


export default ChannelPopup;