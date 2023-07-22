import { useContext } from "react";
import { AppContext } from "../App";
import { selectActiveChannel } from "../slices/channelSlice";
import { useAppSelector } from "../store";
import { closePC } from "../utils";
import useTrickle from "./useTrickle";


const useOffer = () => {
  const {
    pcMap,
    setPcMap,
    vidMap,
    setVidMap,
  } = useContext(AppContext);

  const channel = useAppSelector(selectActiveChannel);

  const trickle = useTrickle()

  const doOffer = async (feed: number, display: any,) => {
    if (!channel) return;

    let pc = pcMap[feed]
    if (!pc) {
      pc = new RTCPeerConnection({
        'iceServers': [{
          urls: 'stun:stun.l.google.com:19302'
        }],
      });

      pc.onnegotiationneeded = event => console.log('pc.onnegotiationneeded', event);
      pc.onicecandidate = event => { 
        console.log('pc.onicecandidate', event);
        trickle(channel?.id, feed, event.candidate);
      }
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
          const newVidMap = { ...vidMap };
          delete newVidMap[feed];
          setVidMap(newVidMap);
          closePC(pcMap, feed, setPcMap);
        }
      };
      /* This one below should not be fired, cause the PC is used just to send */
      pc.ontrack = event => console.log('pc.ontrack', event);

      pcMap[feed] = pc;

      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStream.getTracks().forEach(track => {
          console.log('adding track', track);
          pc.addTrack(track, localStream);
        });
        setVidMap({ ...vidMap, [feed]: {
          stream: localStream,
          display,
        }})

      } catch (e) {
        console.log('error while doing offer', e);
        const newVidMap = { ...vidMap };
        delete newVidMap[feed];
        setVidMap(newVidMap);
        closePC(pcMap, feed, setPcMap);
        return;
      }
    }
    else {
      console.log('Performing ICE restart');
      pcMap[feed].restartIce();
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('set local sdp OK');
      return offer;
    } catch (e) {
      console.log('error while doing offer', e);
      const newVidMap = { ...vidMap };
      delete newVidMap[feed];
      setVidMap(newVidMap);

      closePC(pcMap, feed, setPcMap);
      return;
    }

  }

  return doOffer;
}

export default useOffer;