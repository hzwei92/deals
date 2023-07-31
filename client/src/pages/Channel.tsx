import { IonButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { AppContext } from '../App';
import useJoin from '../hooks/useJoin';
import { activateChannel, selectChannel } from '../slices/channelSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';
import useLeave from '../hooks/useLeave';
import { selectAppUser } from '../slices/userSlice';
import useDisconnect from '../hooks/useDisconnect';
import { closeAllPCs } from '../utils';

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
    pcMap,
    setPcMap,
    pendingOfferMap,
    setPendingOfferMap,
    vidMap,
    setVidMap,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 

  const [isConnected, setIsConnected] = useState(false);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  const join = useJoin();
  const leave = useLeave();
  const disconnect = useDisconnect();

  useEffect(() => {
    const handleDeviceChange = async () => {
      const cameras = await getConnectedDevices('videoinput');
      const microphones = await getConnectedDevices('audioinput');
      setCams(cameras);
      setMics(microphones);
    }

    const getDevices = async () => {
      try {
        const videoCameras = await getConnectedDevices('videoinput');
        console.log('Cameras found:', videoCameras);
        setCams(videoCameras);

        const microphones = await getConnectedDevices('audioinput');
        console.log('Microphones found:', microphones);
        setMics(microphones);

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
      } catch(error) {
        console.error('Error accessing media devices.', error);
      }
    }

    //getDevices();

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    }
  }, []);

  const attachVidSrc = (stream: MediaStream) => (vid: HTMLVideoElement | null) => {
    if (vid) {
      vid.srcObject = stream;
    }
  }

  const scheduleConnection = (function () {
    let task: ReturnType<typeof setTimeout> | null = null;
    const delay = 5000;
  
    return (function (channelId: number, secs: number) {
      if (task) return;
      const timeout = secs * 1000 || delay;
      console.log('scheduled joining in ' + timeout + ' ms');
      task = setTimeout(() => {
        join(channelId);
        task = null;
      }, timeout);
    });
  })();

  const handleClick = () => {
    if (!channel) return;
    if (!isConnected) {
      scheduleConnection(channel.id, 0.1);
    }
  }

  const handleDisconnect = () => {
    leave();
    dispatch(activateChannel(null));
  }

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
          <IonButtons>
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
          Object.entries(vidMap).map(([feed, {stream, display}]) => {
            return (
              <div key={'content-' + feed} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <video key={'stream-'+stream.id} ref={attachVidSrc(stream)} autoPlay={true} muted={parseInt(feed) === user?.id} style={{
                  width: 'calc(50% - 40px)',
                  maxWidth: 420,
                  borderRadius: 5,
                }}></video>
                <div>
                  { feed }
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
