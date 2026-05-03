'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { USER_COLORS, getInitials } from '../lib/utils';

interface Props {
  roomId: string;
  onJoin: (user: { name: string; color: string; initials: string }) => void;
}

export default function NameEntryModal({ roomId, onJoin }: Props) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(USER_COLORS[0]);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem('c2c-user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.name) onJoin(u);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleJoin = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Please enter at least 2 characters.');
      return;
    }
    const user = { name: trimmed, color: selectedColor, initials: getInitials(trimmed) };
    sessionStorage.setItem('c2c-user', JSON.stringify(user));
    onJoin(user);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: '#111114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420, position: 'relative' }}
        >
          <div style={{ position: 'absolute', top: -1, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(79,142,247,0.6), transparent)' }} />

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>Join the room</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Room <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--primary)', fontWeight: 600 }}>{roomId}</span> is waiting for you.
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Your name</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: selectedColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {name ? getInitials(name) : '?'}
              </div>
              <input
                autoFocus
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="e.g. Alex Chen"
                maxLength={32}
                style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 12, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(79,142,247,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-strong)')}
              />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 6 }}>{error}</p>}
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Your color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {USER_COLORS.map(c => (
                <motion.button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `2px solid ${selectedColor === c ? 'white' : 'transparent'}`, cursor: 'pointer', outline: selectedColor === c ? '2px solid ' + c : 'none', outlineOffset: 2 }}
                />
              ))}
            </div>
          </div>

          <motion.button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, borderRadius: 14 }}
            onClick={handleJoin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Enter Room
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
