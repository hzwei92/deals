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
    vidMap,
    setVidMap,
  } = useContext(AppContext);

  const channel = useAppSelector(selectActiveChannel);
  const trickle = useTrickle();

  const doAnswer = async (feed: number, display: any, offer: any) => {
    if (!channel) return;

    let pc = pcMap[feed];
    if (!pc) {
      pc = new RTCPeerConnection({
        'iceServers': [{
          urls: 'stun:stun.l.google.com:19302'
        }],
      });
  
      pc.onnegotiationneeded = event => console.log('pc.onnegotiationneeded', event);
      pc.onicecandidate = event => trickle(channel.id, feed, event.candidate );
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
          const newVidMap = { ...vidMap };
          delete newVidMap[feed];
          setVidMap(newVidMap);

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
        setVidMap({ ...vidMap, [feed]: {
          stream: remoteStream,
          display,
        }});
      };
  
      const newPcMap = { ...pcMap };
      newPcMap[feed] = pc;
      setPcMap(newPcMap)
    }
  
    try {
      await pc.setRemoteDescription(offer);
      console.log('set remote sdp OK');
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('set local sdp OK');
      return answer;
    } catch (e) {
      console.log('error creating subscriber answer', e);

      const newVidMap = { ...vidMap };
      delete newVidMap[feed];
      setVidMap(newVidMap);

      closePC(pcMap, feed, setPcMap);
      throw e;
    }
  }

  return doAnswer;
}

export default useAnswer;