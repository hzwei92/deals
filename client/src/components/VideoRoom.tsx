
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import  { localTracks, remoteTracks, slots, mids, feeds, feedStreams } from '../hooks/useJanus';
import { selectAppUser } from '../slices/userSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { Channel } from '../types/Channel';
import { IonButton, IonButtons } from '@ionic/react';
import { activateChannel, selectActiveChannel } from '../slices/channelSlice';

const getConnectedDevices = async (type: MediaDeviceKind) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === type)
}


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
  const activeChannel = useAppSelector(selectActiveChannel);
  
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);

  const [isConnecting, setIsConnecting] = useState(false);

  const handleClick = () => {
    if (!user) {
      authModal.current?.present();
      return;
    }
    if (!channel) {
      return;
    }
    if (activeChannel?.id !== channel.id) {
      disconnect();
    }
    joinRoom(channel.id, user.id, user.name || 'anon');
    setIsConnecting(true);
  }

  const handleDisconnect = () => {
    disconnect();
    dispatch(activateChannel(null));
  }
  
  useEffect(() => {
    setIsConnecting(false);
  }, [Object.keys(localTracks).length])


  const attachVidSrc = (stream: MediaStream) => (vid: HTMLVideoElement | null) => {
    if (vid) {
      vid.srcObject = stream;
      vid.play();
    }
  }

  return (
    <div style={{
      height: '100%',
      padding: 10,
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: channel.id === activeChannel?.id 
          ? 'flex'
          : 'none',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'start',
        alignItems: 'start'
      }}>
        {
          Object.entries(localTracks).map(([id, stream]) => {
            const feedId = feeds[id];
            return (
              <div key={'local-'+id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                maxWidth: 420,
                margin: 5,
                border: '1px solid',
                padding: 5,
                borderRadius: 5,
              }}>
                <video ref={attachVidSrc(stream as MediaStream)} playsInline={true} autoPlay={true} muted={true} style={{
                  width: '100%',
                  borderRadius: 5,
                  transform: 'rotateY(180deg)'
                }} />
                <div>
                  { user?.name || 'anon' }
                </div>
              </div>
            )
          })
        }
        {
          Object.entries(remoteTracks).map(([mid, stream]) => {
            const slot = slots[mid];
            const videoMid = mids[slot];
            const feedId = feeds[mid];

            if (mid === videoMid) {
              return (
                <div key={'remote-video-' + slot} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  maxWidth: 420,
                  margin: 5,
                  border: '1px solid',
                  padding: 5,
                  borderRadius: 5,
                }}>
                  <video ref={attachVidSrc(stream as MediaStream)} playsInline={true} autoPlay={true} style={{
                    width: '100%',
                    borderRadius: 5,
                  }} />
                  <div>
                    { feedStreams[feedId]?.display }
                  </div>
                </div>
              )
            }
            return (
              <audio key={'remote-audio-' + slot} ref={attachVidSrc(stream as MediaStream)} playsInline={true} autoPlay={true}  style={{
                display: 'none'
              }}/>
            )
          })
        }  
      </div>
      <div style={{ 
        display: 'none',
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
      <IonButtons style={{
        position: 'fixed',
        bottom: 20,
        width: 100,
        left: 'calc(50% - 50px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {
          activeChannel?.id === channel.id
            ? (
              <IonButton onClick={handleDisconnect} style={{
                borderRadius: 20,
                backgroundColor: 'red',
                color: 'white',
                fontSize: 20,
                padding: 10,
                height: 50,
                width: 240,
                fontWeight: 'bold',
              }}>
                DISCONNECT
              </IonButton>
            )
            : (
              <IonButton onClick={handleClick} disabled={isConnecting} style={{
                borderRadius: 20,
                backgroundColor: 'green',
                color: 'white',
                fontSize: 20,
                padding: 10,
                height: 50,
                width: 240,
                fontWeight: 'bold',
              }}>
                {
                  isConnecting 
                    ? 'CONNECTING...'
                    : 'JOIN VIDEO CALL'
                }
              </IonButton>
            )
            
        }
      </IonButtons>
    </div>
  )
}


export default VideoRoom;