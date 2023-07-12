import { IonButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { selectChannel } from '../slices/channelSlice';
import { useAppSelector } from '../store';
import { Channel as ChannelType } from '../types/Channel';

const getConnectedDevices = async (type: MediaDeviceKind) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type)
}

const openMediaDevices = (constraints: MediaStreamConstraints) => {
  return navigator.mediaDevices.getUserMedia(constraints);
}

const openCamera = (cameraId: string, minWidth: number, minHeight: number) => {
  const constraints = {
    audio: true,
    video: {
      deviceId: cameraId,
      width: { min: minWidth },
      height: { min: minHeight },
    },
  };

  return navigator.mediaDevices.getUserMedia(constraints);
}

interface ChannelProps extends RouteComponentProps<{
  id: string;
}> {}

const Channel: React.FC<ChannelProps> = ({ match }) => {
  const channel = useAppSelector(state => selectChannel(state, parseInt(match.params.id))) as ChannelType | null; 

  const [stream, setStream] = useState<MediaStream | null>(null);
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

    const initWebRTC = async () => {
      if (!videoRef.current) return;

      try {
        const mediaStream = await openMediaDevices({'video':true,'audio':true});
        console.log('Got MediaStream:', mediaStream);
        setStream(mediaStream);
        videoRef.current.srcObject = mediaStream;

        const videoCameras = await getConnectedDevices('videoinput');
        console.log('Cameras found:', videoCameras);
        setCams(videoCameras);

        if (videoCameras && videoCameras.length > 0) {
          const cameraStream = await openCamera(videoCameras[0].deviceId, 0, 0);
        }

        const microphones = await getConnectedDevices('audioinput');
        console.log('Microphones found:', microphones);
        setMics(microphones);

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

      } catch(error) {
        console.error('Error accessing media devices.', error);
      }
    }

    initWebRTC();

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    }
  }, [videoRef]);


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
          <video ref={videoRef} autoPlay={true} style={{
            width: '100%',
            borderRadius: 5,
          }}></video>
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
