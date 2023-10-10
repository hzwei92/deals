import { IonButton, IonButtons } from "@ionic/react";
import { Channel } from "../types/Channel";

interface ChannelPopupProps {
  channel: Channel;
  joinChannel: () => void;
}

const ChannelPopup: React.FC<ChannelPopupProps> = ({ channel, joinChannel }) => {
  return (
    <div className="popup" style={{
      marginTop: 5
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        { channel.name } 
      </div>
      <div style={{
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        fontSize: 16
      }}>
        { channel.activeUserCount } people
      </div>
      <IonButtons style={{
        marginTop: 10,
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