import { IonButton, IonButtons, IonContent, IonIcon, IonPage, useIonRouter } from '@ionic/react';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { addChannels, selectChannel } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import { gql, useMutation } from '@apollo/client';
import VideoRoom from '../components/VideoRoom';
import { arrowBackOutline, chatboxEllipsesOutline, navigateCircleOutline, settingsOutline, videocamOutline } from 'ionicons/icons';
import { CHANNEL_FIELDS } from '../fragments/channel';
import { selectMembershipByChannelIdAndUserId } from '../slices/membershipSlice';
import { selectAppUser } from '../slices/userSlice';
import useJoinChannel from '../hooks/useJoinChannel';
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

  const joinChannel = useJoinChannel();

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

    if (!membership) {
      joinChannel(parseInt(match.params.id));
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
          marginLeft: 10,
          marginTop: 10,
          position: 'fixed',
          top: 50,
          left: 0,
          zIndex: 10,
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
            <IonButton routerLink={`/channel/${channel.id}/main`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 16,
              backgroundColor: match.params.mode === 'main' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'main' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={navigateCircleOutline} />
              &nbsp;MAIN
            </IonButton>
            <IonButton routerLink={`/channel/${channel.id}/call`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 16,
              backgroundColor: match.params.mode === 'call' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'call' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={videocamOutline} />
              &nbsp;CALL
            </IonButton>
            <IonButton routerLink={`/channel/${channel.id}/text`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 16,
              backgroundColor: match.params.mode === 'text' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'text' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={chatboxEllipsesOutline} />
              &nbsp;TEXT
            </IonButton>
            <IonButton routerLink={`/channel/${channel.id}/settings`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 16,
              backgroundColor: match.params.mode === 'settings' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'settings' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={settingsOutline} />
              &nbsp;SETTINGS
            </IonButton>
          </IonButtons>
        </div>
        {
            match.params.mode === 'call'
              ? <VideoRoom channel={channel} />
              : match.params.mode === 'text'
                ? <TextThread channel={channel} />
                : match.params.mode === 'go'
                  ? null
                  : match.params.mode === 'settings'
                    ? null
                    : null

        }
      </div>
    </IonPage>
  );
};

export default Channel;
