'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateId, formatTime } from '../lib/utils';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface Props { user: { name: string; color: string; initials: string }; roomId: string; }

interface Tab { id: string; name: string; language: string; content: string; saved: boolean; }

interface FileNode { id: string; name: string; type: 'file'|'folder'; children?: FileNode[]; language?: string; content?: string; expanded?: boolean; }

const LANG_MAP: Record<string, string> = { js: 'javascript', ts: 'typescript', tsx: 'typescript', jsx: 'javascript', py: 'python', java: 'java', cs: 'csharp', php: 'php', html: 'html', css: 'css', json: 'json', md: 'markdown' };
const LANG_VERSIONS: Record<string, string> = { javascript:'18.15.0', python:'3.10.0', typescript:'5.0.3', java:'15.0.2', csharp:'6.12.0', php:'8.2.3', html:'5' };
const THEMES = [{ id:'vs-dark', label:'Dark' },{ id:'vs-light', label:'Light' }];

const DEFAULT_FILES: FileNode[] = [
  { id:'f1', name:'src', type:'folder', expanded:true, children:[
    { id:'f2', name:'App.tsx', type:'file', language:'typescript', content:`import { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="app">\n      <h1>Hello Canvas2Code</h1>\n      <button onClick={() => setCount(c => c + 1)}>\n        Count: {count}\n      </button>\n    </div>\n  );\n}` },
    { id:'f3', name:'utils.ts', type:'file', language:'typescript', content:`export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}\n\nexport const formatDate = (d: Date) =>\n  d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });` },
    { id:'f4', name:'index.css', type:'file', language:'css', content:`* { box-sizing: border-box; margin: 0; padding: 0; }\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;\n  background: #0a0a0a;\n  color: #fff;\n}\n\n.app {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 40px;\n}` },
  ]},
  { id:'f5', name:'package.json', type:'file', language:'json', content:`{\n  "name": "canvas2code-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  }\n}` },
  { id:'f6', name:'README.md', type:'file', language:'markdown', content:`# My Canvas2Code Project\n\nBuilt collaboratively on Canvas2Code.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`` },
];

const AI_RESPONSES: Record<string, string> = {
  default: "I can help you with code. Try asking me to explain code, fix bugs, add features, or write tests.",
  explain: "This code defines a React component that manages state with `useState`. It renders a button that increments a counter on each click. The component re-renders when state changes.",
  fix: "I found a potential issue. Make sure to handle edge cases:\n\n```typescript\n// Before\nfunction divide(a: number, b: number) {\n  return a / b;\n}\n\n// After (safe)\nfunction divide(a: number, b: number): number {\n  if (b === 0) throw new Error('Division by zero');\n  return a / b;\n}\n```",
  optimize: "Here's an optimized version using `useMemo` and `useCallback` to prevent unnecessary re-renders:\n\n```typescript\nconst memoized = useMemo(() => expensiveCalc(data), [data]);\nconst handler = useCallback(() => doSomething(), []);\n```",
  test: "Here's a test for your component:\n\n```typescript\nimport { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport App from './App';\n\ntest('counter increments on click', async () => {\n  render(<App />);\n  const btn = screen.getByRole('button');\n  await userEvent.click(btn);\n  expect(btn).toHaveTextContent('Count: 1');\n});\n```",
  sort: "To sort in JavaScript:\n\n```javascript\n// Alphabetical\n['banana','apple'].sort();\n\n// Numeric (ascending)\n[10,1,5].sort((a,b) => a - b);\n\n// By property\nusers.sort((a,b) => a.name.localeCompare(b.name));\n```",
};

function getAIResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('explain') || lower.includes('what')) return AI_RESPONSES.explain;
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('error')) return AI_RESPONSES.fix;
  if (lower.includes('optim') || lower.includes('performance') || lower.includes('memo')) return AI_RESPONSES.optimize;
  if (lower.includes('test')) return AI_RESPONSES.test;
  if (lower.includes('sort')) return AI_RESPONSES.sort;
  return AI_RESPONSES.default;
}

function FileTree({ nodes, depth=0, onSelect }: { nodes: FileNode[]; depth?: number; onSelect: (f: FileNode) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const icons: Record<string, string> = { typescript:'🔷', javascript:'🟡', python:'🐍', css:'🎨', html:'🌐', json:'📋', markdown:'📝' };
  return (
    <>
      {nodes.map(node => (
        <div key={node.id}>
          <button onClick={() => node.type==='folder' ? setOpen(p=>({...p,[node.id]:!p[node.id]})) : onSelect(node)}
            style={{ display:'flex', alignItems:'center', gap:6, width:'100%', padding:`5px 8px 5px ${12+depth*16}px`, background:'transparent', border:'none', color:'var(--text-secondary)', fontSize:13, cursor:'pointer', borderRadius:6, textAlign:'left', transition:'all 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-elevated)')}
            onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
          >
            <span style={{ fontSize:12, opacity:0.6 }}>{node.type==='folder' ? (open[node.id]||node.expanded ? '▾' : '▸') : (icons[node.language||'']||'📄')}</span>
            <span style={{ flex:1 }}>{node.name}</span>
          </button>
          {node.type==='folder' && (open[node.id]||node.expanded) && node.children && (
            <FileTree nodes={node.children} depth={depth+1} onSelect={onSelect} />
          )}
        </div>
      ))}
    </>
  );
}

export default function CodeEditor({ user, roomId }: Props) {
  const [tabs, setTabs] = useState<Tab[]>([{ id:'t1', name:'App.tsx', language:'typescript', content: DEFAULT_FILES[0].children![0].content!, saved:true }]);
  const [activeTab, setActiveTab] = useState('t1');
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState<{ type:'log'|'error'|'info'; text:string }[]>([{ type:'info', text:'// Output will appear here after running code.' }]);
  const [isRunning, setIsRunning] = useState(false);
  const [showFiles, setShowFiles] = useState(true);
  const [showAI, setShowAI] = useState(true);
  const [showConsole, setShowConsole] = useState(true);
  const [aiMessages, setAiMessages] = useState([{ id:'1', role:'ai', text:'Hi! I\'m your AI assistant. Ask me to explain code, fix bugs, add features, or write tests.' }]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const suppressEmit = useRef(false);
  const emitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tab = tabs.find(t => t.id === activeTab)!;

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('join-room', { roomId, user });

    socket.on('room-state', ({ code }: { code: { content: string; language: string } }) => {
      if (code?.content && code.content !== '// Start coding together...\n') {
        suppressEmit.current = true;
        setTabs(p => p.map((t, i) => i === 0 ? { ...t, content: code.content, language: code.language || t.language } : t));
        suppressEmit.current = false;
      }
    });

    socket.on('code-update', ({ content, language }: { content: string; language: string }) => {
      suppressEmit.current = true;
      setTabs(p => p.map((t, i) => i === 0 ? { ...t, content, language: language || t.language } : t));
      suppressEmit.current = false;
    });

    return () => { socket.disconnect(); };
  }, [roomId]);
;

  const openFile = (f: FileNode) => {
    const existing = tabs.find(t => t.name === f.name);
    if (existing) { setActiveTab(existing.id); return; }
    const newTab: Tab = { id: generateId(), name: f.name, language: f.language||'plaintext', content: f.content||'', saved: true };
    setTabs(p => [...p, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = tabs.findIndex(t => t.id === id);
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (activeTab === id && next.length > 0) setActiveTab(next[Math.max(0, idx-1)].id);
  };

  const updateCode = (val: string | undefined) => {
    if (!val || !tab) return;
    setTabs(p => p.map(t => t.id === activeTab ? { ...t, content: val, saved: false } : t));
    if (!suppressEmit.current) {
      if (emitTimer.current) clearTimeout(emitTimer.current);
      emitTimer.current = setTimeout(() => {
        socketRef.current?.emit('code-change', { content: val, language: tab.language });
      }, 300);
    }
  };

  const runCode = async () => {
    if (!tab) return;
    setIsRunning(true);
    setOutput([{ type:'info', text:`> Running ${tab.name}...` }]);
    try {
      const lang = tab.language === 'typescript' ? 'javascript' : tab.language;
      const version = LANG_VERSIONS[lang] || LANG_VERSIONS.javascript;
      const r = await fetch('https://emkc.org/api/v2/piston/execute', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ language: lang, version, files:[{ content: tab.content }] })
      });
      const d = await r.json();
      const lines = (d.run?.stdout || d.run?.stderr || 'No output').split('\n');
      setOutput([{ type:'info', text:`> ${tab.name} exited with code ${d.run?.code ?? 0}` }, ...lines.map((l: string) => ({ type: d.run?.stderr ? 'error' as const : 'log' as const, text: l }))]);
    } catch { setOutput([{ type:'error', text:'Error: Compiler API unreachable.' }]); }
    finally { setIsRunning(false); }
  };

  const sendAI = () => {
    const q = aiInput.trim();
    if (!q) return;
    const userMsg = { id: generateId(), role:'user', text: q };
    setAiMessages(p => [...p, userMsg]);
    setAiInput('');
    setAiTyping(true);
    setTimeout(() => {
      const resp = getAIResponse(q);
      setAiMessages(p => [...p, { id: generateId(), role:'ai', text: resp }]);
      setAiTyping(false);
    }, 800 + Math.random() * 600);
  };

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:'smooth' }); }, [aiMessages, aiTyping]);

  const bg = theme === 'vs-dark' ? '#1e1e1e' : '#fff';
  const panelBg = theme === 'vs-dark' ? '#252526' : '#f3f3f3';
  const borderClr = theme === 'vs-dark' ? '#3e3e42' : '#ddd';
  const textClr = theme === 'vs-dark' ? '#d4d4d4' : '#333';

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background: bg, color: textClr, fontFamily:'Inter, sans-serif', overflow:'hidden' }}>
      <div style={{ height:40, background: panelBg, borderBottom:`1px solid ${borderClr}`, display:'flex', alignItems:'center', padding:'0 12px', gap:8, flexShrink:0 }}>
        <button onClick={() => setShowFiles(v=>!v)} style={{ padding:'4px 10px', borderRadius:6, border:'none', background: showFiles ? 'rgba(255,255,255,0.1)' : 'transparent', color: textClr, fontSize:12, cursor:'pointer', opacity: showFiles ? 1 : 0.5 }} title="Explorer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        </button>
        <div style={{ flex:1 }} />
        <select value={theme} onChange={e => setTheme(e.target.value)} style={{ background:'transparent', border:`1px solid ${borderClr}`, color: textClr, borderRadius:6, padding:'3px 8px', fontSize:12, cursor:'pointer' }}>
          {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <button onClick={() => setShowAI(v=>!v)} style={{ padding:'4px 10px', borderRadius:6, border:'none', background: showAI ? 'rgba(79,142,247,0.2)' : 'transparent', color: showAI ? '#4f8ef7' : textClr, fontSize:12, fontWeight:600, cursor:'pointer' }}>AI ✦</button>
        <button onClick={runCode} disabled={isRunning} style={{ padding:'5px 16px', borderRadius:8, border:'none', background: isRunning ? '#555' : '#22c55e', color:'white', fontSize:12, fontWeight:600, cursor: isRunning ? 'default' : 'pointer', display:'flex', alignItems:'center', gap:5 }}>
          {isRunning ? '...' : <><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run</>}
        </button>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {showFiles && (
          <div style={{ width:220, background: panelBg, borderRight:`1px solid ${borderClr}`, flexShrink:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:'10px 12px 6px', fontSize:11, fontWeight:600, color:'rgba(128,128,128,0.8)', letterSpacing:1, textTransform:'uppercase' }}>Explorer</div>
            <div style={{ flex:1, overflowY:'auto', padding:'0 4px 8px' }}>
              <FileTree nodes={DEFAULT_FILES} onSelect={openFile} />
            </div>
          </div>
        )}

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
          <div style={{ background: panelBg, borderBottom:`1px solid ${borderClr}`, display:'flex', alignItems:'center', gap:1, overflowX:'auto', flexShrink:0, padding:'0 4px' }}>
            {tabs.map(t => (
              <div key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'0 12px', height:36, cursor:'pointer', borderBottom:`2px solid ${activeTab===t.id ? '#4f8ef7' : 'transparent'}`, background: activeTab===t.id ? (theme==='vs-dark'?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)') : 'transparent', whiteSpace:'nowrap', fontSize:13, color: activeTab===t.id ? textClr : 'rgba(128,128,128,0.8)', transition:'all 0.15s', userSelect:'none', flexShrink:0 }}>
                {!t.saved && <span style={{ width:7, height:7, borderRadius:'50%', background:'#4f8ef7', flexShrink:0 }} />}
                <span>{t.name}</span>
                <button onClick={e => closeTab(t.id, e)} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', opacity:0.5, padding:'1px 2px', borderRadius:3, lineHeight:1, fontSize:14, display:'flex', alignItems:'center' }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ flex:1, position:'relative', overflow:'hidden' }}>

            {tab && (
              <Editor height="100%" language={tab.language} value={tab.content} theme={theme} onChange={updateCode}
                options={{ fontSize:14, minimap:{ enabled:true }, automaticLayout:true, fontFamily:"'JetBrains Mono', monospace", fontLigatures:true, lineHeight:1.6, padding:{ top:12 }, scrollBeyondLastLine:false }}
              />
            )}
          </div>

          {showConsole && (
            <div style={{ height:180, background: theme==='vs-dark'?'#1e1e1e':'#fafafa', borderTop:`1px solid ${borderClr}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
              <div style={{ padding:'6px 12px', background: panelBg, borderBottom:`1px solid ${borderClr}`, display:'flex', gap:12, alignItems:'center' }}>
                <span style={{ fontSize:11, fontWeight:600, color:'rgba(128,128,128,0.8)', letterSpacing:1, textTransform:'uppercase' }}>Output</span>
                <div style={{ flex:1 }} />
                <button onClick={() => setOutput([])} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(128,128,128,0.6)', fontSize:11 }}>Clear</button>
                <button onClick={() => setShowConsole(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(128,128,128,0.6)', fontSize:16, lineHeight:1 }}>×</button>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'8px 12px', fontFamily:"'JetBrains Mono', monospace", fontSize:12 }}>
                {output.map((l, i) => (
                  <div key={i} style={{ color: l.type==='error' ? '#f87171' : l.type==='info' ? '#60a5fa' : '#4ade80', marginBottom:2, lineHeight:1.5 }}>{l.text}</div>
                ))}
              </div>
            </div>
          )}
          {!showConsole && (
            <button onClick={() => setShowConsole(true)} style={{ height:26, background: panelBg, border:'none', borderTop:`1px solid ${borderClr}`, cursor:'pointer', fontSize:11, color:'rgba(128,128,128,0.7)', letterSpacing:1, textTransform:'uppercase' }}>Output</button>
          )}
        </div>

        {showAI && (
          <div style={{ width:300, background: theme==='vs-dark'?'#1a1a2e':'#f8f8fc', borderLeft:`1px solid ${borderClr}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
            <div style={{ padding:'12px 14px', background: panelBg, borderBottom:`1px solid ${borderClr}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:24, height:24, borderRadius:8, background:'linear-gradient(135deg, #4f8ef7, #a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>✦</div>
                <span style={{ fontSize:13, fontWeight:600 }}>AI Assistant</span>
              </div>
              <button onClick={() => setShowAI(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(128,128,128,0.6)', fontSize:16 }}>×</button>
            </div>

            <div style={{ padding:'8px' }}>
              {['Explain code','Fix bug','Write tests','Optimize'].map(q => (
                <button key={q} onClick={() => { setAiInput(q); }} style={{ display:'inline-block', margin:'3px', padding:'4px 10px', borderRadius:999, border:`1px solid ${borderClr}`, background:'transparent', color:textClr, fontSize:11, cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#4f8ef7';(e.currentTarget as HTMLElement).style.color='#4f8ef7';}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=borderClr;(e.currentTarget as HTMLElement).style.color=textClr;}}
                >{q}</button>
              ))}
            </div>

            <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:'0 12px 8px' }}>
              {aiMessages.map(m => (
                <div key={m.id} style={{ marginBottom:12, display:'flex', gap:8, flexDirection: m.role==='user'?'row-reverse':'row', alignItems:'flex-start' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background: m.role==='user' ? user.color : 'linear-gradient(135deg,#4f8ef7,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', flexShrink:0 }}>
                    {m.role==='user' ? user.initials : '✦'}
                  </div>
                  <div style={{ maxWidth:'80%', background: m.role==='user' ? 'rgba(79,142,247,0.15)' : (theme==='vs-dark'?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'), borderRadius:10, padding:'8px 12px', fontSize:12, lineHeight:1.6, color: textClr, border:`1px solid ${m.role==='user'?'rgba(79,142,247,0.2)':borderClr}`, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiTyping && (
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#4f8ef7,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white' }}>✦</div>
                  <div style={{ display:'flex', gap:4, padding:'10px 14px', background: theme==='vs-dark'?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)', borderRadius:10, border:`1px solid ${borderClr}` }}>
                    {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#4f8ef7', animation:`pulse-glow 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding:12, borderTop:`1px solid ${borderClr}` }}>
              <div style={{ display:'flex', gap:6 }}>
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendAI()} placeholder="Ask the AI..." style={{ flex:1, background: theme==='vs-dark'?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)', border:`1px solid ${borderClr}`, borderRadius:8, padding:'8px 12px', fontSize:13, color: textClr, outline:'none', fontFamily:'inherit' }} />
                <button onClick={sendAI} style={{ padding:'8px 12px', borderRadius:8, border:'none', background:'#4f8ef7', color:'white', cursor:'pointer', fontSize:13, fontWeight:600 }}>↑</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ height:24, background: panelBg, borderTop:`1px solid ${borderClr}`, display:'flex', alignItems:'center', padding:'0 12px', gap:16, fontSize:11, color:'rgba(128,128,128,0.7)', flexShrink:0 }}>
        <span>{tab?.language?.toUpperCase()}</span>
        <div style={{ width:1, height:14, background: borderClr }} />
        <span style={{ color:'#22c55e', display:'flex', alignItems:'center', gap:4 }}><span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />{user.name}</span>
        <div style={{ flex:1 }} />
        <span>UTF-8</span>
        <span>LF</span>
        <span>Room: {roomId}</span>
      </div>
    </div>
  );
}