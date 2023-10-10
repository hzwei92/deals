import { IonButton, IonButtons } from "@ionic/react";

interface CreateChannelPopupProps {
  createChannel: () => void;
}
const CreateChannelPopup: React.FC<CreateChannelPopupProps> = ({ createChannel }) => {
  return (
    <div className="popup" style={{
      marginTop: 5
    }}>
      <IonButtons style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
        <IonButton onClick={createChannel} style={{
          color: 'var(--ion-color-primary)',
          border: '1px solid var(--ion-color-primary)',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}>
          CREATE CHANNEL
        </IonButton>
      </IonButtons>
    </div>
  )
}

export default CreateChannelPopup;