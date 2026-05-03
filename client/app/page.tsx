'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const USER_COLORS = ['#4f8ef7','#a78bfa','#34d399','#f59e0b','#f87171','#22d3ee','#fb7185','#a3e635'];

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomUrl(roomId: string) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/room/${roomId}`;
}

export default function LandingPage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleCreate = () => {
    const id = generateRoomId();
    router.push(`/room/${id}`);
  };

  const handleJoin = () => {
    const cleaned = joinId.trim().toUpperCase();
    if (cleaned.length < 4) {
      setJoinError('Please enter a valid room code.');
      return;
    }
    router.push(`/room/${cleaned}`);
  };

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
      title: 'Infinite Canvas',
      desc: 'Draw, sketch, and annotate on an infinite whiteboard with full shape tools, sticky notes, and freehand pen.',
      color: '#4f8ef7',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
      ),
      title: 'Collaborative IDE',
      desc: 'Full Monaco-powered code editor with multi-tab support, file explorer, AI assistant, and live code execution.',
      color: '#a78bfa',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      title: 'Real-time Sync',
      desc: 'See your teammates\' cursors, edits, and drawings update live. No refresh needed — always in sync.',
      color: '#34d399',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      ),
      title: 'Video & Voice',
      desc: 'Built-in WebRTC video and voice calls. See your team face-to-face while collaborating on ideas.',
      color: '#f59e0b',
    },
  ];

  const steps = [
    { n: '01', title: 'Create a Room', desc: 'Click "Create Room" to instantly spin up a private collaborative space — no signup required.' },
    { n: '02', title: 'Share the Link', desc: 'Copy the room link and send it to your teammates via Slack, Discord, or any chat.' },
    { n: '03', title: 'Build Together', desc: 'Draw ideas on the whiteboard, write code side by side, and ship faster as a team.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="orb-1" style={{ position: 'absolute', top: '-20%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="orb-2" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, borderBottom: '1px solid var(--border)' }} className="glass-strong">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/>
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>Canvas2Code</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-ghost" style={{ padding: '8px 18px', fontSize: 14 }} onClick={() => setShowJoin(true)}>Join a Room</button>
          <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 14 }} onClick={handleCreate}>Create Room</button>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 1, paddingTop: 160, paddingBottom: 100, textAlign: 'center', padding: '160px 24px 100px' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.25)', marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} className="animate-pulse-glow" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)' }}>No signup required · Free forever</span>
          </div>

          <h1 style={{ fontSize: 'clamp(42px, 7vw, 86px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 24, maxWidth: 900, margin: '0 auto 24px' }}>
            <span className="gradient-text">Design together.</span>
            <br />
            <span className="gradient-text-blue">Code together.</span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 400 }}>
            The collaborative workspace where ideas become reality. Draw, sketch, and code in real-time with your team — no account needed.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <motion.button
              className="btn-primary"
              style={{ fontSize: 16, padding: '14px 32px' }}
              onClick={handleCreate}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Create a Room
            </motion.button>

            <motion.button
              className="btn-ghost"
              style={{ fontSize: 16, padding: '14px 32px' }}
              onClick={() => setShowJoin(v => !v)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Join a Room
            </motion.button>
          </div>

          <AnimatePresence>
            {showJoin && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 16, padding: 6 }}>
                  <input
                    autoFocus
                    value={joinId}
                    onChange={e => { setJoinId(e.target.value.toUpperCase()); setJoinError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    placeholder="Room code (e.g. AB12CD)"
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, letterSpacing: 2, padding: '8px 16px', width: 220, fontFamily: 'JetBrains Mono, monospace' }}
                    maxLength={10}
                  />
                  <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }} onClick={handleJoin}>Join →</button>
                </div>
                {joinError && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8 }}>{joinError}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginTop: 80, maxWidth: 1000, margin: '80px auto 0', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
        >
          <div style={{ background: '#111114', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#f87171','#fbbf24','#34d399'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>canvas2code.vercel.app/room/XK4M2P</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Alex','Sam','Jordan'].map((n, i) => (
                <div key={n} style={{ width: 28, height: 28, borderRadius: '50%', background: USER_COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', border: '2px solid var(--bg-base)' }}>{n[0]}</div>
              ))}
            </div>
          </div>
          <div style={{ height: 420, background: '#0d0d10', display: 'flex' }}>
            <div style={{ width: 56, background: '#111114', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 8 }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: i === 0 ? 'rgba(79,142,247,0.2)' : 'transparent', border: i === 0 ? '1px solid rgba(79,142,247,0.4)' : 'none' }} />)}
            </div>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <motion.div animate={{ x: [80, 140, 200, 160, 80], y: [100, 60, 140, 200, 100] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', pointerEvents: 'none' }}>
                <div style={{ width: 20, height: 20 }}>
                  <svg viewBox="0 0 24 24" fill="#4f8ef7"><path d="M4 0l16 12-7 2-3 7z"/></svg>
                </div>
                <div style={{ background: '#4f8ef7', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', marginTop: 2 }}>Alex</div>
              </motion.div>
              <motion.div animate={{ x: [280, 220, 300, 350, 280], y: [200, 280, 240, 160, 200] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', pointerEvents: 'none' }}>
                <div style={{ width: 20, height: 20 }}>
                  <svg viewBox="0 0 24 24" fill="#a78bfa"><path d="M4 0l16 12-7 2-3 7z"/></svg>
                </div>
                <div style={{ background: '#a78bfa', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', marginTop: 2 }}>Sam</div>
              </motion.div>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}>
                <motion.path animate={{ d: ['M 60 120 Q 140 60 220 140', 'M 60 120 Q 160 80 240 130', 'M 60 120 Q 140 60 220 140'] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} stroke="#4f8ef7" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <rect x="280" y="80" width="120" height="80" rx="8" stroke="rgba(167,139,250,0.7)" strokeWidth="2" fill="rgba(167,139,250,0.05)"/>
                <circle cx="180" cy="280" r="40" stroke="rgba(52,211,153,0.7)" strokeWidth="2" fill="rgba(52,211,153,0.05)"/>
              </svg>
              <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(255,251,186,0.95)', borderRadius: 10, padding: '10px 14px', width: 140, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontSize: 12, color: '#333', fontWeight: 500 }}>
                💡 Sticky Note<br/><span style={{ color: '#666', fontWeight: 400 }}>Click to edit...</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }} className="gradient-text">Everything you need</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>One workspace. All your collaboration tools.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className="card-hover"
              style={{ padding: 28, borderRadius: 20, background: 'var(--bg-surface)', border: `1px solid ${hoveredCard === i ? f.color + '40' : 'var(--border)'}`, cursor: 'default', transition: 'border-color 0.3s ease' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color + '18', border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-1px', marginBottom: 12 }} className="gradient-text">How it works</h2>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} style={{ display: 'flex', gap: 24, padding: '28px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', fontFamily: 'JetBrains Mono, monospace', minWidth: 28, paddingTop: 2 }}>{s.n}</span>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 40px', borderRadius: 28, background: 'var(--bg-surface)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.15) 0%, transparent 70%)' }} />
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }} className="gradient-text">Ready to collaborate?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>Create a room in one click — no account, no setup, no waiting.</p>
            <motion.button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }} onClick={handleCreate} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Start a Room Now →
            </motion.button>
          </div>
        </motion.div>
      </section>

      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Canvas2Code</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Built for teams who move fast.</p>
      </footer>
    </div>
  );
}