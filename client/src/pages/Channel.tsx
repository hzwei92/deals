import { IonButton, IonButtons, IonContent, IonIcon, IonPage, useIonRouter } from '@ionic/react';
import { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { addChannels, selectChannel } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import { gql, useMutation } from '@apollo/client';
import VideoRoom from '../components/VideoRoom';
import { airplaneOutline, caretDown, caretForward, chatboxEllipsesOutline, navigateCircleOutline, videocamOutline } from 'ionicons/icons';
import { CHANNEL_FIELDS } from '../fragments/channel';
import { selectMembershipByChannelIdAndUserId } from '../slices/membershipSlice';
import { selectAppUser } from '../slices/userSlice';
import TextThread from '../components/TextThread';
import { AppContext } from '../App';

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

  const {
    channelId, 
    setChannelId,
  } = useContext(AppContext);

  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 
  const membership = useAppSelector(state => selectMembershipByChannelIdAndUserId(state, parseInt(match.params.id), user?.id || -1));
  
  const [isLoaded, setIsLoaded] = useState(false);

  const [showInfo, setShowInfo] = useState(true);

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

    if (channelId !== parseInt(match.params.id)) {
      setChannelId(parseInt(match.params.id));
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
            display: 'flex',
            flexDirection: 'row',
          }}>
            <div>
              { channel.name }
            </div>
          </div>
          <IonButtons style={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'row',
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
            <IonButton routerLink={`/channel/${channel.id}/talk`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 16,
              backgroundColor: match.params.mode === 'talk' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'talk' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={videocamOutline} />
              &nbsp;TALK
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
            <IonButton routerLink={`/channel/${channel.id}/roam`} style={{
              border: '1px solid',
              borderRadius: 5,
              fontSize: 16,
              backgroundColor: match.params.mode === 'roam' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
              color: match.params.mode === 'roam' ? 'var(--ion-color-light)' : 'var(--ion-color-primary)',
            }}>
              <IonIcon icon={airplaneOutline} />
              &nbsp;ROAM
            </IonButton>
          </IonButtons>
        </div>
        {
            match.params.mode === 'talk'
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
