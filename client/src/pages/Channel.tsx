import { IonButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import { useContext, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { AppContext } from '../App';
import { selectChannel } from '../slices/channelSlice';
import { useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';

const getConnectedDevices = async (type: MediaDeviceKind) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type)
}

interface ChannelProps extends RouteComponentProps<{
  id: string;
}> {}

const Channel: React.FC<ChannelProps> = ({ match }) => {
  const { remoteStreams } = useContext(AppContext);

  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 

  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

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

    getDevices();

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    }
  }, []);

  const attachVidSrc = (stream: MediaStream) => (vid: HTMLVideoElement | null) => {
    if (vid) {
      vid.srcObject = stream;
    }
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
          {
            remoteStreams.map(stream => {
              return (
                <video key={'stream-'+stream.id} ref={attachVidSrc(stream)} autoPlay={true} style={{
                  width: '100%',
                  borderRadius: 5,
                }}></video>
              )
            })
          }
          <IonButtons>
            <IonButton onClick={() => {}} style={{
              border: '1px solid',
              borderRadius: 5,
            }}>
              CALL
            </IonButton>
          </IonButtons>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Channel;
