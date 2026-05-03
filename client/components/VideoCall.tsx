'use client';
import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import Draggable from 'react-draggable';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

const ICE = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

export default function VideoCall({ roomId, userName }: { roomId: string; userName: string }) {
  const [peers, setPeers] = useState<{ id: string; stream: MediaStream }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState('');

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const draggableRef = useRef<HTMLDivElement>(null);
  const calledPeers = useRef<Set<string>>(new Set());

  const addPeer = (id: string, stream: MediaStream) => {
    setPeers(prev => prev.some(p => p.id === id) ? prev : [...prev, { id, stream }]);
  };

  const callPeer = (peerId: string, stream: MediaStream, peer: Peer) => {
    if (!peerId || calledPeers.current.has(peerId)) return;
    calledPeers.current.add(peerId);
    const call = peer.call(peerId, stream);
    if (!call) return;
    call.on('stream', remote => addPeer(peerId, remote));
    call.on('error', () => calledPeers.current.delete(peerId));
    call.on('close', () => setPeers(p => p.filter(x => x.id !== peerId)));
  };

  useEffect(() => {
    let destroyed = false;

    const init = async () => {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        } catch {
          if (!destroyed) { setStatus('error'); setErrorMsg('No camera or mic found. Check browser permissions.'); }
          return;
        }
      }

      if (destroyed) { stream?.getTracks().forEach(t => t.stop()); return; }

      streamRef.current = stream;
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
        myVideoRef.current.play().catch(() => {});
      }

      const peer = new Peer(undefined as any, { config: { iceServers: ICE } });
      peerRef.current = peer;

      peer.on('open', myPeerId => {
        if (destroyed) return;

        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'], reconnectionAttempts: 5 });
        socketRef.current = socket;

        socket.once('connect', () => {
          socket.emit('join-room', { roomId, user: { name: userName, peerId: myPeerId } });
        });

        socket.on('room-state', ({ users }: { users: any[] }) => {
          if (destroyed) return;
          users.forEach(u => {
            if (u.peerId && u.peerId !== myPeerId) {
              callPeer(u.peerId, stream!, peer);
            }
          });
          setStatus('live');
        });

        socket.on('user-joined', (joinedUser: any) => {
          if (destroyed || !joinedUser.peerId || joinedUser.peerId === myPeerId) return;
          callPeer(joinedUser.peerId, stream!, peer);
        });

        socket.on('user-left', (socketId: string) => {
          setPeers(p => p.filter(x => x.id !== socketId));
        });
      });

      peer.on('call', call => {
        call.answer(stream!);
        call.on('stream', remote => addPeer(call.peer, remote));
        call.on('close', () => setPeers(p => p.filter(x => x.id !== call.peer)));
      });

      peer.on('error', err => {
        console.error('PeerJS:', err);
      });

      if (!destroyed) setStatus('live');
    };

    init();

    return () => {
      destroyed = true;
      socketRef.current?.disconnect();
      peerRef.current?.destroy();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomId, userName]);

  const toggleAudio = () => {
    const tracks = streamRef.current?.getAudioTracks();
    if (!tracks?.length) return;
    tracks[0].enabled = !tracks[0].enabled;
    setIsMuted(!tracks[0].enabled);
  };

  const toggleVideo = () => {
    const tracks = streamRef.current?.getVideoTracks();
    if (!tracks?.length) return;
    tracks[0].enabled = !tracks[0].enabled;
    setIsVideoOff(!tracks[0].enabled);
  };

  const totalParticipants = peers.length + 1;

  return (
    <Draggable bounds="parent" handle=".vc-handle" nodeRef={draggableRef}>
      <div
        ref={draggableRef}
        style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 500,
          background: 'rgba(8,8,12,0.97)', backdropFilter: 'blur(24px)',
          borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)', width: 288,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div
          className="vc-handle"
          style={{
            padding: '10px 14px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)',
            cursor: 'move', userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                background: status === 'live' ? '#34d399' : status === 'error' ? '#f87171' : '#fbbf24',
                boxShadow: status === 'live' ? '0 0 8px #34d39980' : undefined,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>
              {status === 'connecting' ? 'Connecting…' : status === 'error' ? 'No Device' : 'Live Call'}
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            {totalParticipants} in call
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: peers.length > 0 ? '1fr 1fr' : '1fr',
          gap: 1, background: '#000',
        }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', background: '#0d0d12', overflow: 'hidden' }}>
            {status === 'error' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 20 }}>🚫</span>
                <span style={{ color: '#f87171', fontSize: 9, textAlign: 'center', padding: '0 8px' }}>{errorMsg}</span>
              </div>
            ) : (
              <>
                <video
                  ref={myVideoRef}
                  muted
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
                />
                {isVideoOff && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d12' }}>
                    <span style={{ fontSize: 28 }}>👤</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>You</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={toggleAudio}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isMuted ? '#f87171' : 'rgba(255,255,255,0.15)' }}
                    >{isMuted ? '🔇' : '🎙️'}</button>
                    <button
                      onClick={toggleVideo}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isVideoOff ? '#f87171' : 'rgba(255,255,255,0.15)' }}
                    >{isVideoOff ? '🚫' : '📷'}</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {peers.map(p => (
            <PeerVideo key={p.id} stream={p.stream} />
          ))}
        </div>
      </div>
    </Draggable>
  );
}

function PeerVideo({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.srcObject = stream;
    ref.current.play().catch(() => {});
  }, [stream]);

  return (
    <div style={{ position: 'relative', aspectRatio: '4/3', background: '#0d0d12', overflow: 'hidden' }}>
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}