import { IonButton, IonButtons, IonContent, IonHeader, IonPage } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { selectChannel } from '../slices/channelSlice';
import { useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';

interface ChannelProps extends RouteComponentProps<{
  id: string;
}> {}

const Channel: React.FC<ChannelProps> = ({ match }) => {
  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 

  if (!channel) return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader style={{
          margin: 20,
          alignItems: 'center',
        }}>
          <h1>NOT FOUND</h1>
        </IonHeader>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          margin: 'auto',
          maxWidth: 420,
          padding: 20,
          paddingTop: 0,
        }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 'bold',
          }}>
            { channel.name }
          </h1>
          <IonButtons style={{
            marginTop: 15,
          }}>
            <IonButton routerLink='/map' style={{
              border: '1px solid',
              borderRadius: 5,
            }}>
              BACK
            </IonButton>
          </IonButtons>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Channel;
