import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonIcon, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { addChannels, selectChannel } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import { gql, useMutation } from '@apollo/client';
import { Excalidraw } from '@excalidraw/excalidraw';
import { arrowBackOutline, callOutline, chatboxEllipsesOutline, createOutline, globeOutline, settingsOutline } from 'ionicons/icons';
import Tiptap from '../components/Tiptap';
import VideoRoom from '../components/VideoRoom';

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

interface ChannelProps extends RouteComponentProps<{
  id: string;
}> {}

const Channel: React.FC<ChannelProps> = ({ match }) => {
  const dispatch = useAppDispatch();

  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 

  const [isLoaded, setIsLoaded] = useState(false);

  const [mode, setMode] = useState< 'cluster' | 'draw' | 'call' | 'text' | 'settings'>('call');

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
    }
  }, [match.params.id]);

  if (!isLoaded) return (
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
            LOADING...
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

  if (!channel) return (
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
            NOT FOUND
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
        <IonFab slot='fixed' vertical='top' horizontal='end' style={{
          marginTop: 'calc(50vh - 120px)'
        }}>
          <IonFabButton size='small' color={mode === 'cluster' ? 'primary' : 'light'} onClick={() => {
            setMode('cluster');
          }}>
            <IonIcon icon={globeOutline} />
          </IonFabButton>
          <IonFabButton size='small' color={mode === 'draw' ? 'primary' : 'light'} onClick={() => {
            setMode('draw');
          }}>
            <IonIcon icon={createOutline} />
          </IonFabButton>
          <IonFabButton size='small' color={mode === 'call' ? 'primary' : 'light'} onClick={() => {
            setMode('call');
          }}>
            <IonIcon icon={callOutline} />
          </IonFabButton>
          <IonFabButton size='small' color={mode === 'text' ? 'primary' : 'light'} onClick={() => {
            setMode('text');
          }}>
            <IonIcon icon={chatboxEllipsesOutline}/>
          </IonFabButton>
          <IonFabButton size='small' color={mode === 'settings' ? 'primary' : 'light'} onClick={() => {
            setMode('settings')
          }}>
            <IonIcon icon={settingsOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Channel;
