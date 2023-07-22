import { Dispatch, SetStateAction } from "react";

export function Uint8ArrayFromBase64(base64: string) {
  return Uint8Array.from(window.atob(base64), (v) => v.charCodeAt(0));
}

export const openMediaDevices = (constraints: MediaStreamConstraints) => {
  return navigator.mediaDevices.getUserMedia(constraints);
}


const _closePC = (pc: RTCPeerConnection) => {
  if (!pc) return;
  pc.getSenders().forEach(sender => {
    if (sender.track)
      sender.track.stop();
  });
  pc.getReceivers().forEach(receiver => {
    if (receiver.track)
      receiver.track.stop();
  });
  pc.onnegotiationneeded = null;
  pc.onicecandidate = null;
  pc.oniceconnectionstatechange = null;
  pc.ontrack = null;
  pc.close();
}

export const closePC = (pcMap: Record<number, RTCPeerConnection>, feed: number, setPcMap: Dispatch<SetStateAction<Record<number, RTCPeerConnection>>>) => {
  if (!feed) return;
  let pc = pcMap[feed];
  console.log('closing pc for feed', feed);
  _closePC(pc);

  const newPcMap = { ...pcMap };
  delete newPcMap[feed];
  setPcMap(newPcMap);
}

export const closeAllPCs = (pcMap: Record<number, RTCPeerConnection>, setPcMap: Dispatch<SetStateAction<Record<number, RTCPeerConnection>>>) => {
  console.log('closing all pcs');

  Object.entries(pcMap).forEach(([feed, pc]) => {
    console.log('closing pc for feed', feed);
    _closePC(pc);
    
    const newPcMap = { ...pcMap };
    delete newPcMap[parseInt(feed)];
    setPcMap(newPcMap);
  });
}