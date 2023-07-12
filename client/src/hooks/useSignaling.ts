import { gql, useMutation, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import { selectActiveChannel } from "../slices/channelSlice";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { openMediaDevices } from "../utils";

const SIGNAL_MESSAGE = gql`
  mutation SignalMssage($channelId: Int!, $message: MessageInput!) {
    signalMessage(channelId: $channelId, message: $message)
  }
`;

const SIGNAL_SUB = gql`
  subscription SignalMessage($userId: Int!, $channelId: Int!) {
    signalMessage(userId: $userId, channelId: $channelId) {
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
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectActiveChannel);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

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
      userId: user?.id,
      channelId: channel?.id,
    },
    shouldResubscribe: true,
    onData: ({ data: { data: { signalMessage }} }) => {
      console.log(signalMessage);
      receiveMessage(signalMessage)
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

  const init = async () => {
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


    peerConnection1.addEventListener('track', async (event) => {
      const [remoteStream] = event.streams;
      console.log('remoteStream', remoteStream);
      setRemoteStreams([...remoteStreams, remoteStream]);
      //remoteVideo.srcObject = remoteStream;
    });

    const localStream = await openMediaDevices({video: true, audio: true});
    localStream.getTracks().forEach(track => {
        peerConnection1.addTrack(track, localStream);
    });

    const offer = await peerConnection1.createOffer();
    await peerConnection1.setLocalDescription(offer);
    signalMessage({
      variables: { 
        channelId: channel?.id,
        message: { offer },
      },
    });

    console.log(peerConnection1);
    setPeerConnection(peerConnection1);
  }

  useEffect(() => {
    console.log('channel', channel);
    if (!channel) return;
    init();
  }, [channel])



  
  
  return { peerConnection, remoteStreams };
}

