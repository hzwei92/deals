import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App";
import { useAppDispatch, useAppSelector } from "../store";
import { selectAppUser } from "../slices/userSlice";
import { activateChannel } from "../slices/channelSlice";
import { IonButton, IonButtons } from "@ionic/react";
import { localTracks, remoteTracks, feeds } from '../hooks/useJanus';
import { Channel } from "../types/Channel";
import adapter from "webrtc-adapter";


const getConnectedDevices = async (type: MediaDeviceKind) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type)
}


interface VideoRoomProps {
  channel: Channel;
}
const VideoRoom = ({channel}: VideoRoomProps) => {
  const dispatch = useAppDispatch();

  const {
    authModal,
    refresh,
    joinRoom,
    disconnect,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

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

  //   getDevices();

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
    if (!user) {
      authModal.current?.present();
      return;
    }
    dispatch(activateChannel(channel.id));
    joinRoom(channel.id, user.id, user.name || 'anon');
  }

  const handleDisconnect = () => {
    disconnect()
    dispatch(activateChannel(null));
  }

  const handlePlay = () => {
    // navigator.mediaDevices
    //   .getUserMedia({video: true})
    //   .then(stream => videoRefs.current[0].srcObject = stream)
    //   .catch(console.log);

    // videoRefs.current.forEach(vid => {
    //   vid.play()
    // });
  }

  // const videoRefs = useRef<HTMLVideoElement[]>([]);

  return (
    <div>
      <div>
        { cams.map(cam => (<div key={'cam-'+cam.deviceId}>{cam.label}</div>)) }
      </div>
      <div>
        { mics.map(mic => (<div key={'mic-'+mic.deviceId}>{mic.label}</div>)) }
      </div>
      <div style={{
          display: 'none', //flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
        }}>
          {
            Object.entries(localTracks).map(([id, stream]) => {
              console.log('stream', stream)
              return (
                <div key={'local-'+id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <video ref={attachVidSrc(stream as MediaStream)} playsInline={true} autoPlay={true} muted={true} style={{
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
                  <video ref={attachVidSrc(stream as MediaStream)} playsInline={true} autoPlay={true} style={{
                    maxWidth: 420,
                    borderRadius: 5,
                  }} />
                  <div>
                    { feeds[slot] }
                  </div>
                </div>
              )
            })
          }  
        </div>
      <IonButtons style={{
        position: 'fixed',
        bottom: 20,
        width: 100,
        left: 'calc(50% - 50px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <IonButton onClick={handlePlay}>
          Play

        </IonButton>
        <IonButton onClick={handleClick} style={{
          borderRadius: 20,
          backgroundColor: 'green',
          color: 'white',
          fontSize: 20,
          padding: 10,
          height: 50,
          width: 240,
          fontWeight: 'bold',
        }}>
          JOIN VIDEO CALL
        </IonButton>
      </IonButtons>
    </div>
  )
}

export default VideoRoom;