import { gql, useMutation, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import { selectActiveChannel } from "../slices/channelSlice";
import { useAppSelector } from "../store";

const SIGNAL_MESSAGE = gql`
  mutation SignalMssage($channelId: Int!, $message: MessageInput!) {
    signalMessage(channelId: $channelId, message: $message)
  }
`;

const SIGNAL_SUB = gql`
  subscription SignalMessage($channelId: Int!) {
    signalMessage(channelId: $channelId) {
      offer {
        sdp
        type
      }
      answer {
        sdp
        type
      }
      candidate {
        candidate
        sdpMid
        sdpMLineIndex
      }
    }
  }
`;

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

export default function useSignaling() {
  const channel = useAppSelector(selectActiveChannel);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const receiveMessage = async (message: any) => {
    if (!peerConnection) return;
    if (message.answer) {
      const remoteDesc = new RTCSessionDescription(message.answer);
      await peerConnection.setRemoteDescription(remoteDesc);
    }
    if (message.offer) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      signalMessage({
        variables: { 
          channelId: channel?.id,
          message: { answer } 
        },
      });
    }
    if (message.candidate) {
      try {
        await peerConnection.addIceCandidate(message.candidate);
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    }
  }

  useSubscription(SIGNAL_SUB, {
    variables: {
      channelId: channel?.id || 0,
    },
    shouldResubscribe: true,
    onData: ({ data }) => {
      console.log(data);
      const message = {} as any;
      receiveMessage(message)
    },
  });

  const [signalMessage] = useMutation(SIGNAL_MESSAGE, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  useEffect(() => {
    const peerConnection1 = new RTCPeerConnection(configuration);
    peerConnection1.addEventListener('icecandidate', event => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
        signalMessage({
          variables: { 
            channelId: channel?.id,
            message: { candidate: event.candidate },
          },
        });
      }
    });
    peerConnection1.addEventListener('connectionstatechange', event => {
      if (peerConnection1.connectionState === 'connected') {
        console.log('Peers connected!');
      }
    });
    setPeerConnection(peerConnection1);
  }, [])


  const makeCall = async () => {
    if (!peerConnection) return;
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signalMessage({
      variables: { 
        channelId: channel?.id,
        message: { offer },
      },
    });
  }

  
  
  return makeCall;
}

