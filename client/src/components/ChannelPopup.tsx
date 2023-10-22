import { IonAvatar, IonButton, IonButtons, IonCard, IonIcon } from "@ionic/react";
import { Channel } from "../types/Channel";
import { User } from "../types/User";
import { Membership } from "../types/Membership";
import md5 from "md5";
import { flashOutline, videocamOutline } from "ionicons/icons";

interface ChannelPopupProps {
  channel: Channel;
  joinChannel: () => void;
  channelMemberships: any;
  users: Record<number, User>;
}

const ChannelPopup: React.FC<ChannelPopupProps> = ({ channel, joinChannel, channelMemberships, users }) => {
  console.log('channelPopup', channel, channelMemberships, users)
  return (
    <div className="popup" style={{
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',
      }}>
        { channel.name } 
      </div>
      <div style={{
        marginTop: 10,
        textAlign: 'center',
        fontSize: 14,
        color: 'var(--ion-color-medium)'
      }}>
        { channel.detail }
      </div>
      <div style={{
        width: 220,
        maxHeight: 200,
        overflowY: 'scroll',
      }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
      }}>
        {
          channelMemberships
            .sort((a: Membership, b: Membership) => {
              if (a.isActive && !b.isActive) return -1;
              if (!a.isActive && b.isActive) return 1;
              return a.createdAt < b.createdAt ? -1 : 1;
            })
            .map((membership: Membership) => {
              return (
                <IonCard key={membership.id} style={{
                  margin: 0,
                  marginBottom: 5,
                  padding: 5,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'start',
                    fontSize: 12,
                  }}>
                    <IonAvatar style={{
                      paddingTop: 1,
                      width: 20,
                      height: 20,
                      cursor: 'pointer',
                    }}>
                      <img src={`https://www.gravatar.com/avatar/${md5(membership.userId.toString() || '')}?d=retro`} />
                    </IonAvatar>
                    <div style={{
                      paddingLeft: 5,
                      width: 170,
                    }}>
                      { users[membership.userId].name }
                      {
                        membership.userId === channel.ownerId 
                          ? <IonIcon icon={flashOutline} style={{
                              paddingTop: 3,
                              paddingLeft: 3,
                              color: 'var(--ion-color-primary)'
                            }}/>
                          : null
                      }
                    </div>
                  </div>
                  <div style={{
                  }}>
                    {
                      membership.isActive 
                        ? <IonIcon icon={videocamOutline} style={{
                            marginTop: 2,
                            marginLeft: 2,
                            color: 'green'
                          }}/>
                        : null
                    }
                  </div>
                </IonCard>
              )
            })
        }
      </div>
      </div>
      <IonButtons style={{
        marginTop: 15,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <IonButton onClick={joinChannel} style={{
          color: 'var(--ion-color-primary)',
          border: '1px solid var(--ion-color-primary)',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}>
          TALK
        </IonButton>
        <IonButton onClick={joinChannel} style={{
          color: 'var(--ion-color-primary)',
          border: '1px solid var(--ion-color-primary)',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}>
          TEXT
        </IonButton>
        <IonButton onClick={joinChannel} style={{
          color: 'var(--ion-color-primary)',
          border: '1px solid var(--ion-color-primary)',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}>
          ROAM
        </IonButton>
      </IonButtons>
    </div>
  )
}


export default ChannelPopup;