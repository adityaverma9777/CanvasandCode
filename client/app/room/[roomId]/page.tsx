'use client';
import { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NameEntryModal from '../../../components/NameEntryModal';
import { getInitials, copyToClipboard, MOCK_COLLABORATORS } from '../../../lib/utils';

const Board = dynamic(() => import('../../../components/Board'), { ssr: false });
const CodeEditor = dynamic(() => import('../../../components/CodeEditor'), { ssr: false });
const VideoCall = dynamic(() => import('../../../components/VideoCall'), { ssr: false });

type Tab = 'canvas' | 'code';

interface User {
  name: string;
  color: string;
  initials: string;
}

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('canvas');
  const [videoActive, setVideoActive] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [roomUsers, setRoomUsers] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '1') { e.preventDefault(); setActiveTab('canvas'); }
      if ((e.metaKey || e.ctrlKey) && e.key === '2') { e.preventDefault(); setActiveTab('code'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/room/${roomId}`;
    await copyToClipboard(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const allUsers: { name: string; color: string; initials: string; id?: string; socketId?: string }[] = user
    ? [{ ...user, socketId: 'me' }, ...MOCK_COLLABORATORS.slice(0, 2)]
    : MOCK_COLLABORATORS.slice(0, 2);

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }} className="gradient-text">Mobile Coming Soon</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, maxWidth: 320 }}>
          Canvas2Code is optimized for desktop and tablet. A mobile experience is coming soon.
        </p>
        <button className="btn-ghost" style={{ marginTop: 32 }} onClick={() => router.push('/')}>← Back to Home</button>
      </div>
    );
  }

  if (!user) {
    return <NameEntryModal roomId={roomId} onJoin={setUser} />;
  }

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', position: 'relative' }}>

      {videoActive && user && <VideoCall roomId={roomId} userName={user.name} />}

      <header style={{ position: 'absolute', top: 12, left: 12, right: 12, height: 56, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderRadius: 16, gap: 12 }} className="glass-strong">

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px' }}>Canvas2Code</span>
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          <button
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.5, transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            {roomId}
          </button>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 12, padding: 4, gap: 2 }}>
          {(['canvas', 'code'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '6px 18px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 1px 0 rgba(255,255,255,0.05)' : 'none' }}
            >
              {tab === 'canvas' ? '✦ Canvas' : '</> Code'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {allUsers.map((u, i) => (
              <div
                key={u.socketId || u.id || i}
                title={u.name}
                style={{ width: 30, height: 30, borderRadius: '50%', background: u.color, border: '2px solid var(--bg-base)', marginLeft: i === 0 ? 0 : -8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', zIndex: allUsers.length - i, position: 'relative', cursor: 'default', flexShrink: 0 }}
              >
                {u.initials || getInitials(u.name)}
              </div>
            ))}
            <div style={{ marginLeft: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} className="animate-pulse-glow" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{allUsers.length} online</span>
            </div>
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          <button
            onClick={() => setVideoActive(v => !v)}
            style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid', borderColor: videoActive ? 'rgba(52,211,153,0.4)' : 'var(--border)', background: videoActive ? 'rgba(52,211,153,0.1)' : 'var(--bg-elevated)', color: videoActive ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            title={videoActive ? 'Stop video' : 'Start video call'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {videoActive ? <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> : <><path d="M16 16L22 22M22 16L16 22"/><path d="M15 5H1v14h14V5z"/></>}
            </svg>
          </button>

          <button
            onClick={() => { sessionStorage.removeItem('c2c-user'); router.push('/'); }}
            style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
          >
            Leave
          </button>
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative', paddingTop: 80 }}>
        <AnimatePresence mode="wait">
          {activeTab === 'canvas' && (
            <motion.div key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', inset: 0, paddingTop: 80 }}>
              <Board user={user} roomId={roomId} />
            </motion.div>
          )}
          {activeTab === 'code' && (
            <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', inset: 0, paddingTop: 80 }}>
              <CodeEditor user={user} roomId={roomId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 200, backdropFilter: 'blur(10px)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--success)' }}>Room link copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}