import { useContext } from "react";
import { selectActiveChannel } from "../slices/channelSlice";
import { useAppSelector } from "../store";
import useTrickle from "./useTrickle";
import { AppContext } from "../App";
import { closePC } from "../utils";

const useAnswer = () => {
  const {
    pcMap,
    setPcMap,
    setVidMap,
  } = useContext(AppContext);

  const channel = useAppSelector(selectActiveChannel);
  const trickle = useTrickle();

  const doAnswer = async (feed: number, display: string, offer: any) => {
    if (!channel) return;

    console.log(pcMap);

    let pc = pcMap[feed];
    if (!pc) {
      pc = new RTCPeerConnection({
        'iceServers': [{
          urls: 'stun:stun.l.google.com:19302'
        }],
      });
  
      pc.onnegotiationneeded = event => console.log('pc.onnegotiationneeded', event);
      pc.onicecandidate = event => { 
        console.log('pc.onicecandidate', event);
        trickle(feed, event.candidate);
      }
      pc.oniceconnectionstatechange = () => {
        console.log('pc.oniceconnectionstatechange', pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
          setVidMap(prev => {
            const newVidMap = { ...prev };
            delete newVidMap[feed];
            return newVidMap;
          });

          closePC(pcMap, feed, setPcMap);
        }
      };
      pc.ontrack = event => {
        console.log('pc.ontrack', event);
  
        event.track.onunmute = evt => {
          console.log('track.onunmute', evt);
          /* TODO set srcObject in this callback */
        };
        event.track.onmute = evt => {
          console.log('track.onmute', evt);
        };
        event.track.onended = evt => {
          console.log('track.onended', evt);
        };
  
        const remoteStream = event.streams[0];
        setVidMap(prev => ({ ...prev, [feed]: {
          stream: remoteStream,
          display,
        }}));
      };
  
      setPcMap(prev => ({ ...prev, [feed]: pc }));
    }
  
    try {
      await pc.setRemoteDescription(offer);
      console.log('set remote sdp OK', offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('set local sdp OK', answer);
      return answer;
    } catch (e) {
      console.log('error creating subscriber answer', e);

      setVidMap(prev => {
        const newVidMap = { ...prev };
        delete newVidMap[feed];
        return newVidMap;
      });

      closePC(pcMap, feed, setPcMap);
      throw e;
    }
  }

  return doAnswer;
}

export default useAnswer;