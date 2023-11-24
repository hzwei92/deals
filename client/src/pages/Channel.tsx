import { IonButton, IonButtons, IonContent, IonIcon, IonPage, isPlatform, useIonRouter } from '@ionic/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { addChannels, selectFocusChannel, setFocusChannelId } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { gql, useMutation } from '@apollo/client';
import {  closeOutline, scanOutline, star, starOutline } from 'ionicons/icons';
import { CHANNEL_FIELDS } from '../fragments/channel';
import { selectMembershipByChannelIdAndUserId } from '../slices/membershipSlice';
import { selectAppUser } from '../slices/userSlice';
import { useSaveMembership } from '../hooks/useSaveMembership';
import ChannelPopupTalk from '../components/ChannelTalk';
import ChannelPopupText from '../components/ChannelText';
import ChannelPopupRoam from '../components/ChannelRoam';
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
}> {}

const Channel: React.FC<ChannelProps> = ({ match }) => {
  const router = useIonRouter();

  const dispatch = useAppDispatch();

  const {
    authModal,
    streams,
    channelMode,
    setChannelMode,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  const membership = useAppSelector(state => selectMembershipByChannelIdAndUserId(state, channel?.id ?? -1, user?.id ?? -1));

  const [isLoaded, setIsLoaded] = useState(false);

  const saveMembership = useSaveMembership();
  const handleMinimizeClick = () => {
    if (!membership?.id) return;
    saveMembership(membership.id, !membership.isSaved);
  }
  const handleRestoreClick = () => {
    router.push('/map/' + channel?.id, 'none');
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
    console.log(match.params.id)
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

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(headerRef.current?.clientHeight)
  }, [headerRef.current?.clientHeight]);

  if (!isLoaded) return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 5,
          marginTop: isPlatform('ios') && !isPlatform('mobileweb') ? 105 : 50,
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

  if (!channel?.id) return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 5,
          marginTop: isPlatform('ios') && !isPlatform('mobileweb') ? 105 : 50,
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
        height: isPlatform('ios') && !isPlatform('mobileweb') ? 105 : 50,
      }} />
      <IonContent style={{
        overflowY: 'hidden',
      }}>
        <div ref={headerRef}>
          <div style={{
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
              <IonButton onClick={handleMinimizeClick}>
                <IonIcon icon={membership?.isSaved ? star : starOutline} size="small" style={{
                  color: membership?.isSaved ? 'var(--ion-color-primary)' : null
                }}/>
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
            <IonButton onClick={() => setChannelMode('talk')} style={{
              color: channelMode === 'talk' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
              borderBottom: channelMode === 'talk' ? '4px solid var(--ion-color-primary)' : 'none',
              fontWeight: 'bold',
            }}>
              TALK
            </IonButton>
            <IonButton onClick={() => setChannelMode('text')} style={{
              color: channelMode === 'text' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
              borderBottom: channelMode === 'text' ? '4px solid var(--ion-color-primary)' : 'none',
              fontWeight: 'bold',
            }}>
              TEXT
            </IonButton>
            <IonButton onClick={() => setChannelMode('roam')} style={{
              color: channelMode === 'roam' ? 'var(--ion-color-dark)' : 'var(--ion-color-medium)',
              borderBottom: channelMode === 'roam' ? '4px solid var(--ion-color-primary)' : 'none',
              fontWeight: 'bold',
            }}>
              ROAM
            </IonButton>
          </IonButtons>
        </div>
        <div style={{
          paddingTop: 10,
          height: `calc(100% - ${headerRef.current?.clientHeight ?? 0}px)`
        }}>
          {
            channelMode === 'talk'
              ? <ChannelPopupTalk authModal={authModal} streams={streams} />
              : channelMode === 'text'
                ? <ChannelPopupText />
                : channelMode === 'roam'
                  ? <ChannelPopupRoam />
                  : null
          }
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Channel;
