import { IonButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { activateChannel, addChannels, selectChannel } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import { selectAppUser } from '../slices/userSlice';
import { localTracks, remoteTracks, feeds } from '../hooks/useJanus';
import { AppContext } from '../App';
import { gql, useMutation } from '@apollo/client';

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

  const { 
    refresh,
    joinRoom,
    disconnect,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 

  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

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

  // useEffect(() => {
  //   const handleDeviceChange = async () => {
  //     const cameras = await getConnectedDevices('videoinput');
  //     const microphones = await getConnectedDevices('audioinput');
  //     setCams(cameras);
  //     setMics(microphones);
  //   }

  //   const getDevices = async () => {
  //     try {
  //       const videoCameras = await getConnectedDevices('videoinput');
  //       console.log('Cameras found:', videoCameras);
  //       setCams(videoCameras);

  //       const microphones = await getConnectedDevices('audioinput');
  //       console.log('Microphones found:', microphones);
  //       setMics(microphones);

  //       navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
  //     } catch(error) {
  //       console.error('Error accessing media devices.', error);
  //     }
  //   }

  //   //getDevices();

  //   return () => {
  //     navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
  //   }
  // }, []);

  const attachVidSrc = (stream: MediaStream) => (vid: HTMLVideoElement | null) => {
    if (vid) {
      vid.srcObject = stream;
    }
  }

  const handleClick = () => {
    if (!user || !channel) {
      return;
    }
    joinRoom(channel.id, user.id, user.name || 'anon');
  }

  const handleDisconnect = () => {
    disconnect()
    dispatch(activateChannel(null));
  }

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
          <div>
            { cams.map(cam => (<div key={'cam-'+cam.deviceId}>{cam.label}</div>)) }
          </div>
          <div>
            { mics.map(mic => (<div key={'mic-'+mic.deviceId}>{mic.label}</div>)) }
          </div>
          <IonButtons style={{
            marginTop: 15,
          }}>
            <IonButton onClick={handleClick} style={{
              border: '1px solid',
              borderRadius: 5,
            }}>
              CALL
            </IonButton>
            <IonButton onClick={handleDisconnect} style={{
              border: '1px solid',
              borderRadius: 5,
            }}>
              DISCONNECT
            </IonButton>
          </IonButtons>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
        }}>
          {
            Object.entries(localTracks).map(([id, stream]) => {
              return (
                <div key={'local-'+id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <video ref={attachVidSrc(stream as MediaStream)} autoPlay={true} muted={true} style={{
                    width: 'calc(80% - 40px)',
                    maxWidth: 420,
                    borderRadius: 5,
                  }} />
                  <div>
                    {user?.id} (YOU)
                  </div>
                </div>
              )
            })
          }
        {
          Object.entries(remoteTracks).map(([slot, stream]) => {
            console.log('stream', stream)
            if (!stream) {
              return null;
            }
            return (
              <div key={'remote-' + slot} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <video ref={attachVidSrc(stream as MediaStream)} autoPlay={true} style={{
                  width: 'calc(80% - 40px)',
                  maxWidth: 420,
                  borderRadius: 5,
                }}></video>
                <div>
                  { feeds[slot] }
                </div>
              </div>
            )
          })
        }  
      </div>
      </IonContent>
    </IonPage>
  );
};

export default Channel;
