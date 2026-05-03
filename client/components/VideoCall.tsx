'use client';
import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import Draggable from 'react-draggable';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export default function VideoCall({ roomId, userName }: { roomId: string; userName: string }) {
  const [peers, setPeers] = useState<{ id: string; stream: MediaStream }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<Peer | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let peer: Peer;

    const init = async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        } catch {
          setErrorMsg('No camera or mic found. Check browser permissions.');
          return;
        }
      }

      streamRef.current = stream;
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;
      setErrorMsg(null);

      peer = new Peer(undefined as any, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peerInstance.current = peer;

      peer.on('open', (myPeerId) => {
        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.emit('join-room', {
          roomId,
          user: { name: userName, peerId: myPeerId },
        });

        socket.on('user-joined', (joinedUser: any) => {
          if (!joinedUser.peerId) return;
          const call = peer.call(joinedUser.peerId, stream);
          call?.on('stream', (remoteStream) => {
            addPeer(joinedUser.peerId, remoteStream);
          });
        });

        socket.on('user-left', (socketId: string) => {
          setPeers(prev => prev.filter(p => p.id !== socketId));
        });
      });

      peer.on('call', (call) => {
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          addPeer(call.peer, remoteStream);
        });
      });

      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      peerInstance.current?.destroy();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomId, userName]);

  const addPeer = (id: string, stream: MediaStream) => {
    setPeers(prev => {
      if (prev.some(p => p.id === id)) return prev;
      return [...prev, { id, stream }];
    });
  };

  const toggleAudio = () => {
    const stream = streamRef.current;
    if (stream && stream.getAudioTracks().length > 0) {
      const enabled = !stream.getAudioTracks()[0].enabled;
      stream.getAudioTracks()[0].enabled = enabled;
      setIsMuted(!enabled);
    }
  };

  const toggleVideo = () => {
    const stream = streamRef.current;
    if (stream && stream.getVideoTracks().length > 0) {
      const enabled = !stream.getVideoTracks()[0].enabled;
      stream.getVideoTracks()[0].enabled = enabled;
      setIsVideoOff(!enabled);
    }
  };

  return (
    <Draggable bounds="parent" handle=".drag-handle" nodeRef={draggableRef}>
      <div
        ref={draggableRef}
        style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 500,
          background: 'rgba(10,10,14,0.95)', backdropFilter: 'blur(20px)',
          borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)', overflow: 'hidden',
          width: 280, display: 'flex', flexDirection: 'column',
        }}
      >
        <div
          className="drag-handle"
          style={{
            padding: '10px 14px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)',
            cursor: 'move',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: errorMsg ? '#f87171' : '#34d399', boxShadow: errorMsg ? '0 0 6px #f87171' : '0 0 6px #34d399' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Team Call</span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{peers.length + 1} participant{peers.length !== 0 ? 's' : ''}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: peers.length > 0 ? '1fr 1fr' : '1fr', gap: 1, background: '#000' }}>
          <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {errorMsg ? (
              <span style={{ color: '#f87171', fontSize: 10, textAlign: 'center', padding: 8 }}>⚠️ {errorMsg}</span>
            ) : (
              <>
                <video ref={myVideoRef} muted autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 9, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '1px 5px', borderRadius: 4 }}>You</div>
                <div style={{ position: 'absolute', bottom: 4, right: 6, display: 'flex', gap: 4 }}>
                  <button onClick={toggleAudio} style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: isMuted ? '#f87171' : 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isMuted ? '🔇' : '🎙️'}
                  </button>
                  <button onClick={toggleVideo} style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: isVideoOff ? '#f87171' : 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isVideoOff ? '🚫' : '📷'}
                  </button>
                </div>
              </>
            )}
          </div>

          {peers.map((p) => (
            <VideoPlayer key={p.id} stream={p.stream} />
          ))}
        </div>
      </div>
    </Draggable>
  );
}

function VideoPlayer({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = stream; }, [stream]);
  return (
    <div style={{ position: 'relative', aspectRatio: '16/9', background: '#111' }}>
      <video ref={ref} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}