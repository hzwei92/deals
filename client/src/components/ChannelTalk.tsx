import { IonAvatar, IonButton, IonButtons } from "@ionic/react";
import { selectFocusChannel } from "../slices/channelSlice";
import { selectAppUser, selectUsers } from "../slices/userSlice";
import { useAppSelector } from "../store";
import useActivateChannel from "../hooks/useActivateChannel";
import { selectMembershipsByChannelId } from "../slices/membershipSlice";
import { feedStreams, feeds, localTracks } from "../hooks/useJanus";
import { useEffect, useState } from "react";
import md5 from "md5";


const attachStreamSrc = (stream: MediaStream) => (vid: HTMLVideoElement | null) => {
  if (vid) {
    vid.srcObject = stream;
    vid.play();
  }
}

interface ChannelPopupTalkProps {
  authModal: React.RefObject<HTMLIonModalElement>;
  streams: Record<number, any>;
}

const ChannelPopupTalk: React.FC<ChannelPopupTalkProps> = ({ authModal, streams }) => {
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  const memberships = useAppSelector(state => selectMembershipsByChannelId(state, channel?.id ?? -1));

  const users = useAppSelector(selectUsers);

  const activateChannel = useActivateChannel();

  const handleCallClick = () => {
    if (!user?.id) {
      authModal.current?.present();
      return;
    }
    if (!channel?.id) return;
    activateChannel(channel.id);
  };

  const handleLeaveClick = () => {
    activateChannel(null);
  }

  return (
    <div>
      {
        user?.activeChannelId === channel?.id
          ? (
            <IonButtons style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
              <IonButton onClick={handleLeaveClick} style={{
                backgroundColor: 'red',
                color: 'var(--ion-color-dark)',
                borderRadius: '5px',
                fontWeight: 'bold',
              
              }}>
                LEAVE
              </IonButton>
            </IonButtons>
          )
          : (
            <IonButtons style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
              <IonButton onClick={handleCallClick} style={{
                backgroundColor: 'green',
                color: 'var(--ion-color-dark)',
                borderRadius: '5px',
                fontWeight: 'bold',
              
              }}>
                CALL
              </IonButton>
            </IonButtons>
          )
      }
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {
          memberships
            .filter(m => m.isActive)
            .sort((a, b) => {
              if (a.userId === user?.id) return -1;
              if (b.userId === user?.id) return 1;
              if (a.createdAt < b.createdAt) return -1;
              if (a.createdAt > b.createdAt) return 1;
              return 0;
            })
            .map(m => {
              return (
                <div key={'membership-'+m.id} style={{
                  margin: 5,
                  width: 100,
                }}> 
                  <div>
                    { 
                      streams[m.userId]?.video && (m.userId !== user?.id || user?.isCamOn)
                        ? (
                            <video 
                              ref={attachStreamSrc(streams[m.userId].video as MediaStream)} 
                              playsInline={true} 
                              autoPlay={true}
                              muted={true} 
                              style={{
                                width: 100,
                                height: 100,
                                transform: m.userId === user?.id 
                                  ? 'rotateY(180deg)'
                                  : '',
                                border: '1px solid',
                                borderRadius: 5,
                              }} 
                            />  
                        )
                        : (
                          <IonAvatar style={{
                            width: 100,
                            height: 100,
                            border: '1px solid',
                            borderRadius: 5,
                          }}>
                            <img src={`https://www.gravatar.com/avatar/${md5(m.userId.toString() || '')}?d=retro`} />
                          </IonAvatar>
                        )
                    }
                    {
                      streams[m.userId]?.audio && user?.isSoundOn && m.userId !== user?.id
                        ? (
                          <audio 
                            ref={attachStreamSrc(streams[m.userId].audio as MediaStream)}
                            playsInline={true}
                            autoPlay={true}
                            muted={false}
                          />
                        )
                        : null
                    }
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                    { users[m.userId].name }
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
};

export default ChannelPopupTalk;