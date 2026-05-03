'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

function genId() { return Math.random().toString(36).substring(2,8).toUpperCase(); }

const LINES = [
  { text: 'Draw ideas together.',   color: '#00d4ff' },
  { text: 'Code in real-time.',     color: '#a78bfa' },
  { text: 'Ship faster as a team.', color: '#00ff88' },
  { text: 'No setup. Just create.', color: '#f59e0b' },
];

export default function Home() {
  const router = useRouter();
  const [lineIdx, setLineIdx] = useState(0);
  const [showJoin, setShowJoin] = useState(false);
  const [joinId, setJoinId]    = useState('');
  const [joinErr, setJoinErr]  = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tagRef   = useRef<HTMLDivElement>(null);
  const ctaRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(tagRef.current,   { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
      .fromTo(titleRef.current, { opacity: 0, y: 50, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 }, 0.55)
      .fromTo(ctaRef.current,   { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, 1.2);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => (i + 1) % LINES.length), 2400);
    return () => clearInterval(t);
  }, []);

  const handleCreate = () => router.push(`/room/${genId()}`);
  const handleJoin   = () => {
    const c = joinId.trim().toUpperCase();
    if (c.length < 4) { setJoinErr('Enter a valid code.'); return; }
    router.push(`/room/${c}`);
  };

  const line = LINES[lineIdx];

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#060608', position: 'relative' }}>

      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <iframe
          src="https://my.spline.design/boxeshover-S9A2m7zvp1OJJMKaaGQlYTp9/"
          frameBorder="0"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="3D Scene"
        />
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(6,6,8,0.55) 0%, rgba(6,6,8,0.85) 65%, rgba(6,6,8,0.97) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(6,6,8,0.9), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(6,6,8,0.9), transparent)' }} />

      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#4f8ef7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'white', letterSpacing: '-0.4px' }}>Canvas2Code</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowJoin(v => !v)} style={{ padding: '7px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(12px)', transition: 'all .2s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>Join Room</button>
          <motion.button onClick={handleCreate} whileHover={{ scale: 1.06, boxShadow: '0 0 28px rgba(79,142,247,0.55)' }} whileTap={{ scale: 0.95 }} style={{ padding: '7px 20px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg,#4f8ef7,#6366f1)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Create Room →</motion.button>
        </div>
      </nav>

      <AnimatePresence>
        {showJoin && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }} transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }} style={{ position: 'absolute', top: 68, right: 40, zIndex: 20, background: 'rgba(10,10,16,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 18, backdropFilter: 'blur(30px)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Room Code</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input autoFocus value={joinId} onChange={e => { setJoinId(e.target.value.toUpperCase()); setJoinErr(''); }} onKeyDown={e => e.key === 'Enter' && handleJoin()} placeholder="AB12CD" maxLength={10} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 14px', color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: 3, outline: 'none', width: 150, fontFamily: 'JetBrains Mono,monospace' }} />
              <button onClick={handleJoin} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#4f8ef7,#6366f1)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Join</button>
            </div>
            {joinErr && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{joinErr}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        
        <div ref={tagRef} style={{ opacity: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>Real-time collaboration · No signup · Free</span>
        </div>

        <h1 ref={titleRef} style={{ opacity: 0, fontSize: 'clamp(54px, 8vw, 108px)', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1, textAlign: 'center', margin: 0, marginBottom: 28, background: 'linear-gradient(170deg, #ffffff 30%, rgba(255,255,255,0.45) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Canvas2Code
        </h1>

        <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 44 }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={lineIdx}
              initial={{ y: 36, opacity: 0, filter: 'blur(8px)' }}
              animate={{ y: 0,  opacity: 1, filter: 'blur(0px)' }}
              exit={{    y: -36, opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 700, color: line.color, textShadow: `0 0 30px ${line.color}60`, letterSpacing: '-0.4px', margin: 0, whiteSpace: 'nowrap', textAlign: 'center' }}
            >
              {line.text}
            </motion.p>
          </AnimatePresence>
        </div>

        <div ref={ctaRef} style={{ opacity: 0, display: 'flex', gap: 12, pointerEvents: 'auto' }}>
          <motion.button
            onClick={handleCreate}
            whileHover={{ scale: 1.06, boxShadow: '0 0 50px rgba(79,142,247,0.45)' }}
            whileTap={{ scale: 0.95 }}
            style={{ padding: '14px 36px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#4f8ef7,#6366f1,#a78bfa)', backgroundSize: '200%', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.3px' }}
            className="animate-gradient-shift"
          >
            + Create a Room
          </motion.button>
          <motion.button
            onClick={() => setShowJoin(v => !v)}
            whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            style={{ padding: '14px 32px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(12px)' }}
          >
            Join a Room
          </motion.button>
        </div>
      </div>
    </div>
  );
}