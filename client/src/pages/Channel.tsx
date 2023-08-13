import { IonButton, IonButtons, IonContent, IonIcon, IonPage } from '@ionic/react';
import { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { activateChannel, addChannels, selectChannel } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import { selectAppUser } from '../slices/userSlice';
import { AppContext } from '../App';
import { gql, useMutation } from '@apollo/client';
import VideoRoom from '../components/VideoRoom';
import { arrowBackOutline } from 'ionicons/icons';
import { Excalidraw } from '@excalidraw/excalidraw';
import Tiptap from '../components/Tiptap';

const GET_CHANNEL = gql`
  mutation GetChannel($id: Int!) {
    getChannel(id: $id) {
      id
      name
      detail
      ownerId
      lat
      lng
      createdAt
      updatedAt
      deletedAt
    }
  }
`;


const getConnectedDevices = async (type: MediaDeviceKind) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type)
}

interface ChannelProps extends RouteComponentProps<{
  id: string;
}> {}

const Channel: React.FC<ChannelProps> = ({ match }) => {
  const dispatch = useAppDispatch();
  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 

  const [mode, setMode] = useState<'cluster' | 'draw' | 'call' | 'text' | 'settings'>('call');
  const [isLoaded, setIsLoaded] = useState(false);

  const [getChannel] = useMutation(GET_CHANNEL, {
    onError: (error) => {
      console.log(error);
    },
    onCompleted: ({ getChannel }) => {
      console.log(getChannel);
      dispatch(addChannels([getChannel]));
      setIsLoaded(true);
    },
  });

  useEffect(() => {
    if (!channel) {
      getChannel({
        variables: {
          id: parseInt(match.params.id),
        }
      });
    }
    else {
      setIsLoaded(true);
      dispatch(activateChannel(channel.id));
    }
  }, [channel?.id, match.params.id]);

  if (!isLoaded) return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          marginLeft: 5,
          marginTop: 5,
        }}>
          <IonButtons style={{
            display: 'inline-flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <IonButton routerLink='/map' style={{
            }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <div style={{
            display: 'inline-flex',
            fontSize: 32,
            fontWeight: 'bold',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            LOADING...
          </div>
        </div>
      </IonContent>
    </IonPage>
  );

  if (!channel) return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          marginLeft: 5,
          marginTop: 5,
        }}>
          <IonButtons style={{
            display: 'inline-flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <IonButton routerLink='/map' style={{
            }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <div style={{
            display: 'inline-flex',
            fontSize: 32,
            fontWeight: 'bold',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            NOT FOUND...
          </div>
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'start',
          marginLeft: 5,
          marginTop: 5,
        }}>
          <IonButtons style={{
            display: 'inline-flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <IonButton routerLink='/map' style={{
            }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <div style={{
            display: 'inline-flex',
            fontSize: 32,
            fontWeight: 'bold',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            { channel.name }
          </div>
        </div>

        <div style={{
          display: mode === 'cluster' ? 'block' : 'none',
        }}>
          
        </div>
        <div style={{
          height: 'calc(100% - 40px)',
          display: mode === 'draw' ? 'block' : 'none'
        }}>
          <Excalidraw
            theme={'dark'}
          />
        </div>
        <div style={{
          display: mode === 'call' ? 'block' : 'none',
        }}>
          <VideoRoom channel={channel} />
        </div>
        <div style={{
          display: mode === 'text' ? 'block' : 'none',
        }}>
          <Tiptap />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Channel;
