'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function LandingPage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleCreate = () => router.push(`/room/${generateRoomId()}`);

  const handleJoin = () => {
    const cleaned = joinId.trim().toUpperCase();
    if (cleaned.length < 4) { setJoinError('Enter a valid room code.'); return; }
    router.push(`/room/${cleaned}`);
  };

  const features = [
    { icon: '✦', color: '#4f8ef7', title: 'Infinite Canvas', desc: 'Draw, sketch, and annotate with a full suite of tools — pen, shapes, sticky notes, and more.' },
    { icon: '</>', color: '#a78bfa', title: 'Live Code IDE', desc: 'Full Monaco editor with multi-tab support, AI assistant, file explorer, and real-time execution.' },
    { icon: '⬡', color: '#34d399', title: 'Real-time Sync', desc: 'Every stroke, keystroke, and action synced instantly across all participants in the room.' },
    { icon: '◉', color: '#f59e0b', title: 'Video & Voice', desc: 'Built-in WebRTC video calls floating right over your workspace — no extra tools needed.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080808', overflowX: 'hidden', color: 'white' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 64 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>Canvas2Code</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <button
            onClick={() => setShowJoin(v => !v)}
            style={{ padding: '8px 20px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', backdropFilter: 'blur(10px)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            Join Room
          </button>
          <motion.button
            onClick={handleCreate}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{ padding: '8px 20px', borderRadius: 999, border: 'none', background: 'white', color: '#080808', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Create Room →
          </motion.button>
        </motion.div>
      </nav>

      <AnimatePresence>
        {showJoin && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', top: 72, right: 40, zIndex: 300, background: 'rgba(14,14,18,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 16, backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Enter Room Code</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                autoFocus
                value={joinId}
                onChange={e => { setJoinId(e.target.value.toUpperCase()); setJoinError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="e.g. AB12CD"
                maxLength={10}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 14px', color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: 3, outline: 'none', width: 180, fontFamily: 'JetBrains Mono, monospace' }}
              />
              <button onClick={handleJoin} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#4f8ef7', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Join</button>
            </div>
            {joinError && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{joinError}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <section style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'auto' }}>
          <iframe
            src="https://my.spline.design/boxeshover-S9A2m7zvp1OJJMKaaGQlYTp9/"
            frameBorder="0"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            title="3D Interactive Boxes"
          />
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.7) 45%, rgba(8,8,8,0.1) 75%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to top, #080808 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, transparent 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 40px', maxWidth: 640, pointerEvents: 'none' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 999, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.3)', marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#4f8ef7', letterSpacing: 0.5 }}>No account required · Free to use</span>
            </div>

            <h1 style={{ fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-2.5px', marginBottom: 24 }}>
              <span style={{ display: 'block', background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Design.</span>
              <span style={{ display: 'block', background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Code.</span>
              <span style={{ display: 'block', background: 'linear-gradient(135deg, #4f8ef7 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Together.</span>
            </h1>

            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 40, maxWidth: 480, fontWeight: 400 }}>
              The real-time collaborative workspace where your team draws ideas and ships code — all in one room, instantly.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', pointerEvents: 'auto' }}>
              <motion.button
                onClick={handleCreate}
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(79,142,247,0.35)' }}
                whileTap={{ scale: 0.96 }}
                style={{ padding: '14px 32px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #4f8ef7, #6366f1)', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Create a Room
              </motion.button>
              <motion.button
                onClick={() => setShowJoin(v => !v)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{ padding: '14px 32px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(10px)' }}
              >
                Join a Room
              </motion.button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </motion.div>
        </motion.div>
      </section>

      <section style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 14 }}>
            <span style={{ background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Everything in one place.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 17, maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>One room. Infinite canvas. Full-featured IDE. Real-time voice.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{ padding: 28, borderRadius: 20, background: hoveredFeature === i ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hoveredFeature === i ? f.color + '40' : 'rgba(255,255,255,0.07)'}`, cursor: 'default', transition: 'all 0.3s ease', transform: hoveredFeature === i ? 'translateY(-4px)' : 'translateY(0)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 13, background: f.color + '18', border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: f.color, marginBottom: 18, fontWeight: 700 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ padding: '100px 40px', maxWidth: 760, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: 56, textAlign: 'center' }}
        >
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1.2px' }}>
            <span style={{ background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Up and running in seconds.</span>
          </h2>
        </motion.div>
        {[
          { n: '01', title: 'Create a Room', desc: 'Click "Create a Room" — no sign-up, no waiting. You get a unique shareable room link instantly.' },
          { n: '02', title: 'Invite Your Team', desc: 'Share the room link via Slack, Discord, or email. Your teammates join in one click.' },
          { n: '03', title: 'Build Together', desc: 'Use the canvas to sketch ideas, switch to the IDE to write code, and call each other face-to-face.' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: 28, padding: '32px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4f8ef7', fontFamily: 'JetBrains Mono, monospace', minWidth: 28, paddingTop: 4 }}>{s.n}</span>
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px' }}>{s.title}</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section style={{ padding: '80px 40px 120px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div style={{ maxWidth: 620, margin: '0 auto', padding: '64px 48px', borderRadius: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-1px', marginBottom: 14 }}>
              <span style={{ background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Ready to collaborate?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>Create a room in one click. No account, no setup, no waiting.</p>
            <motion.button
              onClick={handleCreate}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(79,142,247,0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: '15px 40px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #4f8ef7, #6366f1)', color: 'white', fontSize: 17, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Start a Room Now →
            </motion.button>
          </div>
        </motion.div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M12 8v8"/></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Canvas2Code</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Built for teams who move fast.</p>
      </footer>
    </div>
  );
}