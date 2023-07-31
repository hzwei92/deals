import { useContext } from "react";
import { AppContext } from "../App";
import { closePC } from "../utils";
import useTrickle from "./useTrickle";


const useOffer = () => {
  const {
    pcMap,
    setPcMap,
    setVidMap,
  } = useContext(AppContext);

  const trickle = useTrickle()

  const doOffer = async (feed: number, display: any) => {
    console.log(pcMap);

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
      /* This one below should not be fired, cause the PC is used just to send */
      pc.ontrack = event => console.log('pc.ontrack', event);

      setPcMap(prev => ({ ...prev, [feed]: pc }));

      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStream.getTracks().forEach(track => {
          console.log('adding track', track);
          pc.addTrack(track, localStream);
        });
        setVidMap(prev => ({ ...prev, [feed]: {
          stream: localStream,
          display,
        }}));
      } 
      catch (e) {
        console.log('error while doing offer', e);
        setVidMap(prev => {
          const newVidMap = { ...prev };
          delete newVidMap[feed];
          return newVidMap;
        });
        closePC(pcMap, feed, setPcMap);
        return;
      }
    }
    else {
      console.log('Performing ICE restart');
      pc.restartIce();
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('set local sdp OK', offer);
      return offer;
    } catch (e) {
      console.log('error while doing offer', e);
      setVidMap(prev => {
        const newVidMap = { ...prev };
        delete newVidMap[feed];
        return newVidMap;
      });
      closePC(pcMap, feed, setPcMap);
      return;
    }
  }

  return doOffer;
}

export default useOffer;