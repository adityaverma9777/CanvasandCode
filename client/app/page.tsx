'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';

function genId() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }

const LINES = [
  { text: 'Where teams sketch, code, and ship.',   color: '#e2c68f' },
  { text: 'One room. Every tool. Zero friction.',   color: '#a3b18a' },
  { text: 'From whiteboard to production, live.',   color: '#d4a0a0' },
  { text: 'The workspace that moves with you.',     color: '#b8cce0' },
];

const FEATS = [
  { num:'01', accent:'#e2c68f', title:'Infinite Canvas', desc:'Freehand pen, shapes, arrows, sticky notes — on an infinite zoomable surface synced in real time across every participant.', tags:['Pen','Shapes','Sticky Notes','Export PNG/PDF'] },
  { num:'02', accent:'#a3b18a', title:'Live Code IDE', desc:'Monaco-powered editor with multi-tab, file explorer, 6+ languages, and instant code execution via Piston API — all inside the room.', tags:['Monaco','Multi-tab','File Explorer','Run Code'] },
  { num:'03', accent:'#d4a0a0', title:'AI Code Assistant', desc:'Built-in AI that explains code, catches bugs, writes tests, and suggests optimizations — right inside the editor panel, zero context switching.', tags:['Explain','Debug','Test','Optimize'] },
  { num:'04', accent:'#b8cce0', title:'Video & Voice', desc:'Native WebRTC calls floating over the workspace. Drag anywhere, toggle camera or mic independently. No plugins or installs.', tags:['WebRTC','Draggable','Camera','Mic'] },
  { num:'05', accent:'#c9b1d0', title:'Instant Rooms', desc:'One click to create, share a link, your team joins. No accounts, no installs, no waiting. Presence indicators and live cursors built in.', tags:['No Signup','Share Link','Presence','Live Cursors'] },
];

function GlassBtn({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 300, damping: 24 });
  const rotY = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 300, damping: 24 });
  const spotL = useTransform(mx, [0, 1], ['0%', '100%']);
  const spotT = useTransform(my, [0, 1], ['0%', '100%']);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.button ref={ref} onClick={onClick} onMouseMove={onMove} onMouseLeave={onLeave} whileTap={{ scale: 0.95 }}
      style={{
        rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', position: 'relative', overflow: 'hidden',
        padding: '14px 36px', borderRadius: 12,
        border: `1px solid ${primary ? 'rgba(226,198,143,0.3)' : 'rgba(255,255,255,0.1)'}`,
        background: primary ? 'rgba(226,198,143,0.08)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)', color: primary ? '#e2c68f' : 'rgba(255,255,255,0.7)',
        fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: primary ? '0 0 0 1px rgba(226,198,143,0.1) inset, 0 8px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.3)',
        letterSpacing: '-0.2px',
      }}>
      <motion.div style={{
        position: 'absolute', width: 100, height: 100, borderRadius: '50%',
        background: primary ? 'rgba(226,198,143,0.15)' : 'rgba(255,255,255,0.06)',
        filter: 'blur(28px)', pointerEvents: 'none',
        left: spotL, top: spotT, transform: 'translate(-50%, -50%)',
      }} />
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
    </motion.button>
  );
}

function CanvasArt({ color }: { color: string }) {
  return (
    <div style={{ width:'100%', height:'100%', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
        <motion.path d="M 20 100 Q 50 20, 100 60 T 180 40" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" initial={{ pathLength:0, opacity:0 }} whileInView={{ pathLength:1, opacity:1 }} viewport={{ once:true }} transition={{ duration:2, ease:'easeInOut' }} />
        <motion.rect x="120" y="70" width="50" height="35" rx="4" stroke={`${color}90`} strokeWidth="1.5" fill={`${color}08`} initial={{ scale:0, opacity:0 }} whileInView={{ scale:1, opacity:1 }} viewport={{ once:true }} transition={{ delay:0.8, duration:0.6 }} />
        <motion.circle cx="55" cy="95" r="18" stroke={`${color}70`} strokeWidth="1.5" fill={`${color}06`} initial={{ scale:0 }} whileInView={{ scale:1 }} viewport={{ once:true }} transition={{ delay:1.2, duration:0.5, ease:'backOut' }} />
        <motion.rect x="15" y="45" width="30" height="22" rx="3" fill={`${color}20`} initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:1.5, duration:0.4 }} />
      </svg>
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)`, pointerEvents:'none' }} />
    </div>
  );
}

function CodeArt({ color }: { color: string }) {
  const lines = ['const room = create();','room.on("join", sync);','editor.run(code);','export default app;'];
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, lineHeight:2.2 }}>
        {lines.map((l,i) => (
          <motion.div key={i} initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay:0.3+i*0.25, duration:0.5 }}>
            <span style={{ color:'rgba(255,255,255,0.15)', marginRight:12 }}>{i+1}</span>
            <span style={{ color:`${color}cc` }}>{l}</span>
            {i===0 && <motion.span animate={{ opacity:[1,0] }} transition={{ duration:0.8, repeat:Infinity }} style={{ display:'inline-block', width:1, height:14, background:color, marginLeft:2, verticalAlign:'middle' }} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AIArt({ color }: { color: string }) {
  const dots = Array.from({length:6},(_,i)=>i);
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
      <motion.div animate={{ rotate:360 }} transition={{ duration:20, repeat:Infinity, ease:'linear' }} style={{ width:100, height:100, position:'relative' }}>
        {dots.map(i => (
          <motion.div key={i} animate={{ scale:[0.8,1.2,0.8], opacity:[0.3,0.8,0.3] }} transition={{ duration:2, delay:i*0.3, repeat:Infinity }} style={{ position:'absolute', width:8, height:8, borderRadius:'50%', background:color, top:50+Math.sin(i*Math.PI/3)*45, left:50+Math.cos(i*Math.PI/3)*45, transform:'translate(-50%,-50%)', boxShadow:`0 0 12px ${color}60` }} />
        ))}
        <div style={{ position:'absolute', inset:'35%', borderRadius:'50%', border:`1px solid ${color}30` }} />
      </motion.div>
    </div>
  );
}

function VideoArt({ color }: { color: string }) {
  const bars = Array.from({length:12},(_,i)=>i);
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}>
      {bars.map(i => (
        <motion.div key={i} animate={{ scaleY:[0.3,1,0.3] }} transition={{ duration:0.8+Math.random()*0.6, delay:i*0.07, repeat:Infinity, ease:'easeInOut' }} style={{ width:4, height:40, borderRadius:2, background:`${color}90`, transformOrigin:'center' }} />
      ))}
    </div>
  );
}

function RoomArt({ color }: { color: string }) {
  const nodes = [{x:30,y:40},{x:100,y:20},{x:170,y:45},{x:65,y:100},{x:135,y:110}];
  const edges = [[0,1],[1,2],[0,3],[3,4],[1,4],[2,4]];
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="200" height="140" viewBox="0 0 200 140" fill="none">
        {edges.map(([a,b],i) => (
          <motion.line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={`${color}40`} strokeWidth="1" initial={{ pathLength:0 }} whileInView={{ pathLength:1 }} viewport={{ once:true }} transition={{ delay:0.2+i*0.15, duration:0.6 }} />
        ))}
        {nodes.map((n,i) => (
          <motion.circle key={i} cx={n.x} cy={n.y} r="6" fill={`${color}30`} stroke={color} strokeWidth="1.5" initial={{ scale:0 }} whileInView={{ scale:1 }} viewport={{ once:true }} transition={{ delay:0.5+i*0.15, duration:0.4, ease:'backOut' }} />
        ))}
      </svg>
    </div>
  );
}

const ART_MAP = [CanvasArt, CodeArt, AIArt, VideoArt, RoomArt];

export default function Home() {
  const router = useRouter();
  const [lineIdx, setLineIdx] = useState(0);
  const [showJoin, setShowJoin] = useState(false);
  const [joinId, setJoinId] = useState('');
  const [joinErr, setJoinErr] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(tagRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
      .fromTo(titleRef.current, { opacity: 0, y: 55, filter: 'blur(14px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1 }, 0.5)
      .fromTo(subRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 1.05)
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 1.35);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLineIdx(i => (i + 1) % LINES.length), 2800);
    return () => clearInterval(t);
  }, []);

  const handleCreate = () => router.push(`/room/${genId()}`);
  const handleJoin = () => {
    const c = joinId.trim().toUpperCase();
    if (c.length < 4) { setJoinErr('Enter a valid code.'); return; }
    router.push(`/room/${c}`);
  };

  const line = LINES[lineIdx];

  return (
    <div style={{ minHeight: '100vh', background: '#08080a', color: '#fff', overflowX: 'hidden', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', height: 56, backdropFilter: 'blur(24px)', background: 'rgba(8,8,10,0.5)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontWeight: 600, fontSize: 15, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px', color: 'rgba(255,255,255,0.85)' }}>Canvas2Code</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowJoin(v => !v)} style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>Join</button>
          <motion.button onClick={handleCreate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} style={{ padding: '6px 18px', borderRadius: 8, border: '1px solid rgba(226,198,143,0.25)', background: 'rgba(226,198,143,0.08)', color: '#e2c68f', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Create Room</motion.button>
        </div>
      </nav>

      <AnimatePresence>
        {showJoin && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.18 }} style={{ position: 'fixed', top: 64, right: 36, zIndex: 400, background: 'rgba(12,12,14,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, backdropFilter: 'blur(30px)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Room Code</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input autoFocus value={joinId} onChange={e => { setJoinId(e.target.value.toUpperCase()); setJoinErr(''); }} onKeyDown={e => e.key === 'Enter' && handleJoin()} placeholder="AB12CD" maxLength={10} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '9px 14px', color: 'white', fontSize: 15, fontWeight: 600, letterSpacing: 3, outline: 'none', width: 140, fontFamily: 'JetBrains Mono,monospace' }} />
              <button onClick={handleJoin} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(226,198,143,0.3)', background: 'rgba(226,198,143,0.1)', color: '#e2c68f', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Join</button>
            </div>
            {joinErr && <p style={{ color: '#d4a0a0', fontSize: 12, marginTop: 8 }}>{joinErr}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <iframe src="https://my.spline.design/boxeshover-S9A2m7zvp1OJJMKaaGQlYTp9/" frameBorder="0" style={{ width: '100%', height: '100%', border: 'none' }} title="3D" />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 70% at 50% 48%, rgba(8,8,10,0.55) 0%, rgba(8,8,10,0.88) 55%, rgba(8,8,10,0.98) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to bottom, #08080a, transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to top, #08080a, transparent)' }} />

        <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', textAlign: 'center', padding: '0 24px' }}>

          <div ref={tagRef} style={{ opacity: 0, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '5px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', marginBottom: 32 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a3b18a', boxShadow: '0 0 8px #a3b18a', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5 }}>Real-time collaboration · No signup · Free</span>
          </div>

          <h1 ref={titleRef} style={{ opacity: 0, fontSize: 'clamp(60px, 10vw, 130px)', fontWeight: 800, letterSpacing: '-5px', lineHeight: 0.92, margin: '0 0 32px', fontFamily: "'Syne', sans-serif", background: 'linear-gradient(175deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.25) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Canvas2Code
          </h1>

          <div ref={subRef} style={{ opacity: 0, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 48 }}>
            <AnimatePresence mode="wait">
              <motion.p key={lineIdx} initial={{ y: 28, opacity: 0, filter: 'blur(5px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: -28, opacity: 0, filter: 'blur(5px)' }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ fontSize: 'clamp(15px, 2vw, 20px)', fontWeight: 500, color: line.color, margin: 0, whiteSpace: 'nowrap', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.2px' }}>
                {line.text}
              </motion.p>
            </AnimatePresence>
          </div>

          <div ref={ctaRef} style={{ opacity: 0, display: 'flex', gap: 12, pointerEvents: 'auto', perspective: '800px' }}>
            <GlassBtn primary onClick={handleCreate}>Create a Room</GlassBtn>
            <GlassBtn onClick={() => setShowJoin(v => !v)}>Join a Room</GlassBtn>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }} style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </motion.div>
        </motion.div>
      </section>

      <section style={{ padding: '100px 40px 120px', background: '#08080a', maxWidth: 1000, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ marginBottom: 72, textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.15)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14, fontFamily: 'JetBrains Mono,monospace' }}>Features</p>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, letterSpacing: '-1.2px', color: 'rgba(255,255,255,0.85)', fontFamily: "'Syne', sans-serif", margin: 0, lineHeight: 1.2 }}>Everything your team needs.<br /><span style={{ color: 'rgba(255,255,255,0.25)' }}>Nothing it doesn&apos;t.</span></h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {FEATS.map((f, i) => {
            const Art = ART_MAP[i];
            const reverse = i % 2 !== 0;
            return (
              <motion.div key={f.num} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row', gap: 0, borderRadius: 22, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', minHeight: 240 }}
              >
                <div style={{ flex: '0 0 42%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: `${f.accent}05`, borderRight: reverse ? 'none' : '1px solid rgba(255,255,255,0.04)', borderLeft: reverse ? '1px solid rgba(255,255,255,0.04)' : 'none', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${reverse ? '80%' : '20%'} 50%, ${f.accent}0a 0%, transparent 70%)`, pointerEvents: 'none' }} />
                  <Art color={f.accent} />
                </div>
                <div style={{ flex: 1, padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.15)', fontFamily: 'JetBrains Mono,monospace', letterSpacing: 2 }}>{f.num}</span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.accent, opacity: 0.5 }} />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.5px', color: 'rgba(255,255,255,0.9)', fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, marginBottom: 20, maxWidth: 400 }}>{f.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {f.tags.map(t => (
                      <span key={t} style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${f.accent}20`, color: `${f.accent}aa`, fontSize: 11, fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: '60px 40px 100px', textAlign: 'center', background: '#08080a' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '56px 40px', borderRadius: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(ellipse, rgba(226,198,143,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 10, fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.85)' }}>Ready to build together?</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15, marginBottom: 36, lineHeight: 1.65 }}>Create a room. Share the link. Start shipping.</p>
            <div style={{ display: 'flex', justifyContent: 'center', perspective: '800px' }}>
              <GlassBtn primary onClick={handleCreate}>Start a Room →</GlassBtn>
            </div>
          </div>
        </motion.div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '20px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#08080a' }}>
        <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "'Syne', sans-serif", color: 'rgba(255,255,255,0.4)' }}>Canvas2Code</span>
        <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 12 }}>Built for teams who move fast.</p>
      </footer>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}