import { IonAvatar, IonButton, IonButtons } from "@ionic/react";
import { Channel } from "../types/Channel";
import { User } from "../types/User";
import { Membership } from "../types/Membership";
import md5 from "md5";

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
      <span style={{
        fontSize: 24,
        fontWeight: 'bold',
        
      }}>
        { channel.name } 
      </span>
      <div style={{
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        fontSize: 16,
      }}>
        { channel.memberCount } member{ channel.memberCount !== 1 ? 's' : ''}
      </div>
      <div style={{
        marginTop: 10,
        display: channel.activeUserCount > 0 ? 'flex': 'none',
        flexDirection: 'row',
        justifyContent: 'center',
        fontSize: 16,
        color: '#f4900c',
      }}>
        LIVE! 
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
      }}>
        {
          channelMemberships
            .filter((membership: Membership) => membership.isActive)
            .map((membership: Membership) => {
              return (
                <div key={membership.id} style={{
                  marginTop: 5,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  fontSize: 16
                }}>
                  <IonAvatar style={{
                    marginTop: 2,
                    width: 15,
                    height: 15,
                    cursor: 'pointer',
                  }}>
                    <img src={`https://www.gravatar.com/avatar/${md5(membership.userId.toString() || '')}?d=retro`} />
                  </IonAvatar>
                  &nbsp;
                  { users[membership.userId].name ?? 'anon' }
                </div>
              )
            })
        }
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
          JOIN CHANNEL
        </IonButton>
      </IonButtons>
    </div>
  )
}


export default ChannelPopup;