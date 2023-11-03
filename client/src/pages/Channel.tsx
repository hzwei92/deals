import { IonButton, IonButtons, IonContent, IonIcon, IonPage, useIonRouter } from '@ionic/react';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { addChannels, selectChannel, selectFocusChannel, setFocusChannelId } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import { gql, useMutation } from '@apollo/client';
import VideoRoom from '../components/VideoRoom';
import { airplaneOutline, chatboxEllipsesOutline, closeOutline, navigateCircleOutline, removeOutline, scanOutline, stopOutline, videocamOutline } from 'ionicons/icons';
import { CHANNEL_FIELDS } from '../fragments/channel';
import { selectMembershipByChannelIdAndUserId } from '../slices/membershipSlice';
import { selectAppUser } from '../slices/userSlice';
import TextThread from '../components/TextThread';

const GET_CHANNEL = gql`
  mutation GetChannel($id: Int!) {
    getChannel(id: $id) {
      ...ChannelFields
    }
  }
  ${CHANNEL_FIELDS}
`;

interface ChannelProps extends RouteComponentProps<{
  id: string;
  mode: string;
}> {}

const Channel: React.FC<ChannelProps> = ({ match }) => {
  const router = useIonRouter();

  const dispatch = useAppDispatch();

  const channel = useAppSelector(selectFocusChannel);

  const [mode, setMode]  = useState<'talk' | 'text' | 'roam'>('talk');
  const [isLoaded, setIsLoaded] = useState(false);

  const handleRestoreClick = () => {
    router.push('/map/' + channel?.id + '/' + mode, 'none');
  }

  const handleCloseClick = () => {
    router.push('/map', 'none');
  }

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
    if (channel?.id === parseInt(match.params.id)) {
      setIsLoaded(true);
    }
    else {
      getChannel({
        variables: {
          id: parseInt(match.params.id),
        }
      });

      dispatch(setFocusChannelId(parseInt(match.params.id)));
    }
  }, [match.params.id]);

  if (!isLoaded) return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 5,
          marginTop: 5,
        }}>
          <div style={{
            display: 'flex',
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
          flexDirection: 'column',
          marginLeft: 5,
          marginTop: 5,
        }}>
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
        marginTop: 55,
        fontSize: 24,
        padding: 10,
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
          <IonButton>
            <IonIcon icon={removeOutline} size="small" />
          </IonButton>
          <IonButton onClick={handleRestoreClick}>
            <IonIcon icon={scanOutline} size="small" />
          </IonButton>
          <IonButton onClick={handleCloseClick}>
            <IonIcon icon={closeOutline} size="small"/>
          </IonButton>
        </IonButtons>
      </div>
      <div style={{
        padding: 10,
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
        <IonButton onClick={() => setMode('talk')} style={{
          color: mode === 'talk' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: mode === 'talk' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          TALK
        </IonButton>
        <IonButton onClick={() => setMode('text')} style={{
          color: mode === 'text' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: mode === 'text' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          TEXT
        </IonButton>
        <IonButton onClick={() => setMode('roam')} style={{
          color: mode === 'roam' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
          borderBottom: mode === 'roam' ? '4px solid var(--ion-color-primary)' : 'none',
          fontWeight: 'bold',
        }}>
          ROAM
        </IonButton>
      </IonButtons>
      </IonContent>
    </IonPage>
  );
};

export default Channel;
