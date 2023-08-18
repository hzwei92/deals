
import { useContext, useRef, useState } from 'react';
import { AppContext } from '../App';
import  { localTracks, remoteTracks, feeds } from '../hooks/useJanus';
import { selectAppUser } from '../slices/userSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel } from '../types/Channel';
import { IonButton, IonButtons } from '@ionic/react';
import { activateChannel } from '../slices/channelSlice';

interface VideoRoomProps {
  channel: Channel;
}
const VideoRoom = ({ channel }: VideoRoomProps) => {
  const dispatch = useAppDispatch();
  const {
    joinRoom,
    disconnect,
    authModal,
    refresh,
  } = useContext(AppContext);

  const user = useAppSelector(selectAppUser);
  
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  const handleClick = () => {
    if (!user) {
      authModal.current?.present();
      return;
    }
    if (!channel) {
      return;
    }
    joinRoom(channel.id, user.id, user.name || 'anon');
  }

  const handleDisconnect = () => {
    disconnect()
    dispatch(activateChannel(null));
  }


  const attachVidSrc = (stream: MediaStream) => (vid: HTMLVideoElement | null) => {
    if (vid) {
      vid.srcObject = stream;
      vid.play();

      vids.current.push(vid);
    }
  }

  const vids = useRef<HTMLVideoElement[]>([]);

  const handlePlay = () => {
    vids.current.reduce(async (acc, vid) => {
      await acc;
      return vid.play();
    }, Promise.resolve())
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
    }}>
      <div style={{ 
        margin: 'auto',
        maxWidth: 420,
        padding: 20,
        paddingTop: 0,
      }}>
        <div>
          { cams.map(cam => (<div key={'cam-'+cam.deviceId}>{cam.label}</div>)) }
        </div>
        <div>
          { mics.map(mic => (<div key={'mic-'+mic.deviceId}>{mic.label}</div>)) }
        </div>
      </div>
      {
        Object.entries(localTracks).map(([id, stream]) => {
          return (
            <div key={'local-'+id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <video ref={attachVidSrc(stream as MediaStream)} playsInline={true} autoPlay={true} muted={true} style={{
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
        console.log('stream', (stream as MediaStream));
        if (!stream) {
          return null;
        }
        return (
          <div key={'remote-' + slot} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <video ref={attachVidSrc(stream as MediaStream)} playsInline={true} autoPlay={true} muted={true} style={{
              width: 'calc(80% - 40px)',
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