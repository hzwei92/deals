import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonIcon, IonPage, isPlatform, useIonRouter } from '@ionic/react';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { addChannels, selectChannel } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import { gql, useMutation } from '@apollo/client';
import VideoRoom from '../components/VideoRoom';
import { arrowBackOutline, callOutline, chatboxEllipsesOutline, createOutline, globeOutline, linkOutline, navigateCircleOutline, pinOutline, radioOutline, settingsOutline, textOutline, videocamOutline } from 'ionicons/icons';
import { Excalidraw } from '@excalidraw/excalidraw';
import Tiptap from '../components/Tiptap';
import { CHANNEL_FIELDS } from '../fragments/channel';
import { selectMembershipByChannelIdAndUserId } from '../slices/membershipSlice';
import { selectAppUser } from '../slices/userSlice';

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
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 
  const membership = useAppSelector(state => selectMembershipByChannelIdAndUserId(state, parseInt(match.params.id), user?.id || -1));
  
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
    if (channel) {
      setIsLoaded(true);
    }
    else {
      getChannel({
        variables: {
          id: parseInt(match.params.id),
        }
      });
    }

    if (membership) {
      // set membership.isActive to true
    }
    else {
      // create membership
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
          <IonButtons style={{
          }}>
            <IonButton routerLink='/map' style={{
            }}>
              <IonIcon icon={arrowBackOutline} />
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
          <IonButtons style={{
          }}>
            <IonButton routerLink='/map' style={{
            }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <div style={{
        marginTop: 50,
        height: 'calc(100% - 50px)',
        backgroundColor: 'var(--ion-color-light)',
        overflowY: 'scroll',
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
          marginLeft: 5,
          marginTop: 10,
        }}>
          <div style={{
            fontSize: 32,
            fontWeight: 'bold',
          }}>
            { channel.name }
          </div>
          <IonButtons style={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'row',
            justiyContent: 'space-between',
          }}>
            <IonButton routerLink={`/channel/${channel.id}/call`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 12,
              backgroundColor: match.params.mode === 'call' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'call' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={videocamOutline} />
              &nbsp;CALL
            </IonButton>
            <IonButton routerLink={`/channel/${channel.id}/text`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 12,
              backgroundColor: match.params.mode === 'text' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'text' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={chatboxEllipsesOutline} />
              &nbsp;TEXT
            </IonButton>
            <IonButton routerLink={`/channel/${channel.id}/move`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 12,
              backgroundColor: match.params.mode === 'move' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'move' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={navigateCircleOutline} />
              &nbsp;MOVE
            </IonButton>
            <IonButton routerLink={`/channel/${channel.id}/settings`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 12,
              backgroundColor: match.params.mode === 'settings' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'settings' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={settingsOutline} />
              &nbsp;SETTINGS
            </IonButton>
          </IonButtons>

        </div>


        <div style={{
          display: match.params.mode === 'call' ? 'block' : 'none',
        }}>
          <VideoRoom channel={channel} />
        </div>
        <div style={{
          display: match.params.mode === 'text' ? 'block' : 'none',
        }}>
          <Tiptap />
        </div>
        <div style={{
          display: match.params.mode === 'go' ? 'block' : 'none',
        }}>
          move
        </div>
        <div style={{
          display: match.params.mode === 'set' ? 'block' : 'none',
        }}>
          settings
        </div>
      </div>
    </IonPage>
  );
};

export default Channel;
