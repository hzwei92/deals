import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonIcon, IonPage, isPlatform, useIonRouter } from '@ionic/react';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { addChannels, selectChannel } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import { gql, useMutation } from '@apollo/client';
import VideoRoom from '../components/VideoRoom';
import { arrowBackOutline, callOutline, chatboxEllipsesOutline, createOutline, globeOutline, settingsOutline } from 'ionicons/icons';
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
      <div style={{
        marginTop: 50,
        height: 'calc(100% - 50px)',
        backgroundColor: 'var(--ion-color-light)',
        overflowY: 'scroll',
      }}>
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
          display: match.params.mode === 'go' ? 'block' : 'none',
        }}>
          
        </div>
        <div style={{
          height: 'calc(100% - 40px)',
          display: match.params.mode === 'draw' ? 'block' : 'none'
        }}>
          <Excalidraw
            theme={'dark'}
          />
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
          display: match.params.mode === 'set' ? 'block' : 'none',
        }}>
          settings
        </div>
        <IonFab slot='fixed' vertical='top' horizontal='end' style={{
          marginTop: 'calc(50vh - 120px)'
        }}>
          <IonFabButton size='small' color={match.params.mode === 'go' ? 'primary' : 'light'} onClick={() => {
            router.push('/channel/' + channel.id + '/go');
          }}>
            <IonIcon icon={globeOutline} />
          </IonFabButton>
          <IonFabButton size='small' color={match.params.mode === 'draw' ? 'primary' : 'light'} onClick={() => {
            router.push('/channel/' + channel.id + '/draw');
          }}>
            <IonIcon icon={createOutline} />
          </IonFabButton>
          <IonFabButton size='small' color={match.params.mode === 'call' ? 'primary' : 'light'} onClick={() => {
            router.push('/channel/' + channel.id + '/call');

          }}>
            <IonIcon icon={callOutline} />
          </IonFabButton>
          <IonFabButton size='small' color={match.params.mode === 'text' ? 'primary' : 'light'} onClick={() => {
            router.push('/channel/' + channel.id + '/text');
          }}>
            <IonIcon icon={chatboxEllipsesOutline}/>
          </IonFabButton>
          <IonFabButton size='small' color={match.params.mode === 'set' ? 'primary' : 'light'} onClick={() => {
            router.push('/channel/' + channel.id + '/set');
          }}>
            <IonIcon icon={settingsOutline} />
          </IonFabButton>
        </IonFab>
      </div>
    </IonPage>
  );
};

export default Channel;
