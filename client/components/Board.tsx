'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Ellipse, Arrow, Text, Transformer, Group } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { generateId } from '../lib/utils';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

type Tool = 'select'|'pen'|'rect'|'circle'|'arrow'|'text'|'sticky'|'eraser';

interface El {
  id: string; type: Tool;
  points?: number[];
  x?: number; y?: number; width?: number; height?: number;
  text?: string; stroke: string; fill?: string;
  strokeWidth: number; opacity: number; fontSize?: number;
}

const COLORS = ['#ffffff','#f87171','#fb923c','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6','#000000'];
const PALETTE = ['#1a1a2e','#e2e8f0'];
const WIDTHS = [2, 4, 8];

interface Props { user: { name: string; color: string; initials: string }; roomId: string; }

export default function Board({ user, roomId }: Props) {
  const [elements, setElements] = useState<El[]>([]);
  const [history, setHistory] = useState<El[][]>([[]]);
  const [histIdx, setHistIdx] = useState(0);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#ffffff');
  const [strokeW, setStrokeW] = useState(3);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState<El|null>(null);

  const isDrawing = useRef(false);
  const startPt = useRef({ x: 0, y: 0 });
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const suppressEmit = useRef(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('join-room', { roomId, user });

    socket.on('room-state', ({ canvasElements }: { canvasElements: El[] }) => {
      if (canvasElements?.length) {
        suppressEmit.current = true;
        setElements(canvasElements);
        setHistory([canvasElements]);
        setHistIdx(0);
        suppressEmit.current = false;
      }
    });

    socket.on('canvas-elements', (els: El[]) => {
      suppressEmit.current = true;
      setElements(els);
      suppressEmit.current = false;
    });

    socket.on('canvas-clear', () => {
      suppressEmit.current = true;
      setElements([]);
      setHistory([[]]);
      setHistIdx(0);
      suppressEmit.current = false;
    });

    return () => { socket.disconnect(); };
  }, [roomId]);


  const push = useCallback((els: El[]) => {
    const next = history.slice(0, histIdx + 1);
    next.push(els);
    setHistory(next);
    setHistIdx(next.length - 1);
    setElements(els);
    if (!suppressEmit.current) {
      socketRef.current?.emit('canvas-elements', els);
    }
  }, [history, histIdx]);

  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    const ni = histIdx - 1;
    setHistIdx(ni); setElements(history[ni]);
  }, [histIdx, history]);

  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return;
    const ni = histIdx + 1;
    setHistIdx(ni); setElements(history[ni]);
  }, [histIdx, history]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey||e.metaKey) && e.key==='z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey||e.metaKey) && (e.key==='y'||(e.shiftKey&&e.key==='z'))) { e.preventDefault(); redo(); }
      if (e.key==='Delete'||e.key==='Backspace') {
        if (selectedId) { setSelectedId(null); push(elements.filter(el => el.id !== selectedId)); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [undo, redo, selectedId, elements, push]);



  useEffect(() => {
    if (trRef.current && selectedId) {
      const node = layerRef.current?.findOne('#' + selectedId);
      if (node) { trRef.current.nodes([node]); trRef.current.getLayer()?.batchDraw(); }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, elements]);

  const getRelPt = () => {
    const stage = stageRef.current;
    const ptr = stage.getPointerPosition();
    return { x: (ptr.x - stage.x()) / stage.scaleX(), y: (ptr.y - stage.y()) / stage.scaleY() };
  };

  const handleMouseDown = (e: any) => {
    if (tool === 'select') {
      if (e.target === stageRef.current) setSelectedId(null);
      return;
    }
    if (tool === 'eraser') return;
    isDrawing.current = true;
    const pt = getRelPt();
    startPt.current = pt;
    if (tool === 'pen') {
      const newEl: El = { id: generateId(), type: 'pen', points: [pt.x, pt.y], stroke: color, strokeWidth: strokeW, opacity: 1 };
      setElements(prev => [...prev, newEl]);
    } else if (tool === 'text') {
      const txt = prompt('Enter text:');
      if (txt) {
        const newEl: El = { id: generateId(), type: 'text', x: pt.x, y: pt.y, text: txt, stroke: color, strokeWidth: 1, opacity: 1, fontSize: 18, fill: color };
        push([...elements, newEl]);
      }
      isDrawing.current = false;
    } else if (tool === 'sticky') {
      const txt = prompt('Sticky note text:') || 'Note...';
      const newEl: El = { id: generateId(), type: 'sticky', x: pt.x, y: pt.y, width: 160, height: 120, text: txt, stroke: '#f59e0b', fill: 'rgba(251,191,36,0.9)', strokeWidth: 1, opacity: 1, fontSize: 13 };
      push([...elements, newEl]);
      isDrawing.current = false;
    } else {
      setPreview({ id: 'preview', type: tool, x: pt.x, y: pt.y, width: 0, height: 0, stroke: color, fill: 'transparent', strokeWidth: strokeW, opacity: 1, points: [pt.x, pt.y, pt.x, pt.y] });
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const pt = getRelPt();
    if (tool === 'pen') {
      setElements(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.type !== 'pen') return prev;
        const updated = { ...last, points: [...(last.points || []), pt.x, pt.y] };
        return [...prev.slice(0, -1), updated];
      });
    } else if (['rect','circle','arrow'].includes(tool)) {
      setPreview(prev => prev ? {
        ...prev,
        width: pt.x - startPt.current.x,
        height: pt.y - startPt.current.y,
        points: [startPt.current.x, startPt.current.y, pt.x, pt.y],
      } : null);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (tool === 'pen') {
      push([...elements]);
    } else if (preview && ['rect','circle','arrow'].includes(tool)) {
      const el: El = { ...preview, id: generateId() };
      push([...elements, el]);
      setPreview(null);
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const old = stage.scaleX();
    const ptr = stage.getPointerPosition();
    const pt = { x: (ptr.x - stage.x()) / old, y: (ptr.y - stage.y()) / old };
    const ns = e.evt.deltaY > 0 ? Math.max(0.1, old * 0.92) : Math.min(5, old * 1.08);
    setScale(ns);
    setPos({ x: ptr.x - pt.x * ns, y: ptr.y - pt.y * ns });
  };

  const handleExportPNG = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement('a'); a.href = uri; a.download = 'canvas2code-board.png'; a.click();
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const pdf = new jsPDF('landscape', 'px', [1200, 675]);
    pdf.addImage(uri, 'PNG', 0, 0, 1200, 675);
    pdf.save('canvas2code-board.pdf');
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', label: 'Select V', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 0l16 12-7 2-3 7z"/></svg> },
    { id: 'pen', label: 'Pen P', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
    { id: 'rect', label: 'Rect R', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg> },
    { id: 'circle', label: 'Circle C', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg> },
    { id: 'arrow', label: 'Arrow A', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> },
    { id: 'text', label: 'Text T', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> },
    { id: 'sticky', label: 'Sticky S', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15.5 3H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2V8.5L15.5 3z"/><polyline points="15 3 15 9 21 9"/></svg> },
    { id: 'eraser', label: 'Eraser E', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 20 7 20"/><path d="M6.5 15.5L3 12l8-8 7 7-4 4H6.5z"/></svg> },
  ];

  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const h = typeof window !== 'undefined' ? window.innerHeight - 80 : 700;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0f0f14', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ background: 'rgba(14,14,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 8, display: 'flex', flexDirection: 'column', gap: 2, backdropFilter: 'blur(20px)' }}>
          {tools.map(t => (
            <button key={t.id} title={t.label} className={`tool-btn${tool === t.id ? ' active' : ''}`} onClick={() => setTool(t.id)}>{t.icon}</button>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
          <button title="Undo (Ctrl+Z)" className="tool-btn" onClick={undo} disabled={histIdx <= 0}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
          </button>
          <button title="Redo (Ctrl+Y)" className="tool-btn" onClick={redo} disabled={histIdx >= history.length - 1}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/></svg>
          </button>
          <button title="Clear canvas" className="tool-btn" onClick={() => push([])} style={{ color: 'var(--danger)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>

        <div style={{ background: 'rgba(14,14,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 8, backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, width: 88 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{ width: 22, height: 22, borderRadius: 6, background: c, border: `2px solid ${color === c ? 'white' : 'transparent'}`, cursor: 'pointer', outline: 'none', boxShadow: color === c ? `0 0 0 1px ${c}` : 'none' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
            {WIDTHS.map(w => (
              <button key={w} onClick={() => setStrokeW(w)} style={{ width: 28, height: 28, borderRadius: 8, background: strokeW === w ? 'rgba(79,142,247,0.2)' : 'transparent', border: `1px solid ${strokeW === w ? 'rgba(79,142,247,0.5)' : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: w * 2.5, height: w * 2.5, borderRadius: '50%', background: 'white', opacity: 0.8 }} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(14,14,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 6, backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button title="Export PNG" className="tool-btn" onClick={handleExportPNG} style={{ fontSize: 10, width: 'auto', padding: '4px 8px', gap: 4, flexDirection: 'row' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            PNG
          </button>
          <button title="Export PDF" className="tool-btn" onClick={handleExportPDF} style={{ fontSize: 10, width: 'auto', padding: '4px 8px', gap: 4, flexDirection: 'row' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            PDF
          </button>
        </div>
      </div>

      <Stage ref={stageRef} width={w} height={h} scaleX={scale} scaleY={scale} x={pos.x} y={pos.y}
        draggable={tool === 'select'} onDragEnd={e => setPos({ x: e.target.x(), y: e.target.y() })}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: tool === 'select' ? 'default' : tool === 'eraser' ? 'cell' : 'crosshair' }}
      >
        <Layer ref={layerRef}>
          {elements.map(el => {
            const common = { id: el.id, opacity: el.opacity, draggable: tool === 'select', onClick: () => tool === 'select' && setSelectedId(el.id), onDragEnd: (e: any) => { const updated = elements.map(x => x.id === el.id ? { ...x, x: e.target.x(), y: e.target.y() } : x); push(updated); } };
            if (el.type === 'pen' || el.type === 'eraser') return <Line key={el.id} {...common} points={el.points} stroke={el.stroke} strokeWidth={el.strokeWidth} tension={0.4} lineCap="round" lineJoin="round" globalCompositeOperation={el.type === 'eraser' ? 'destination-out' : 'source-over'} />;
            if (el.type === 'rect') return <Rect key={el.id} {...common} x={el.x} y={el.y} width={el.width} height={el.height} stroke={el.stroke} fill={el.fill || 'transparent'} strokeWidth={el.strokeWidth} cornerRadius={4} />;
            if (el.type === 'circle') return <Ellipse key={el.id} {...common} x={(el.x||0) + (el.width||0)/2} y={(el.y||0) + (el.height||0)/2} radiusX={Math.abs((el.width||0)/2)} radiusY={Math.abs((el.height||0)/2)} stroke={el.stroke} fill={el.fill || 'transparent'} strokeWidth={el.strokeWidth} />;
            if (el.type === 'arrow') return <Arrow key={el.id} {...common} points={el.points||[]} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.stroke} pointerLength={10} pointerWidth={8} />;
            if (el.type === 'text') return <Text key={el.id} {...common} x={el.x} y={el.y} text={el.text} fontSize={el.fontSize||18} fill={el.fill||el.stroke} fontFamily="Inter, sans-serif" />;
            if (el.type === 'sticky') return (
              <Group key={el.id} {...common} x={el.x} y={el.y}>
                <Rect width={el.width||160} height={el.height||120} fill="rgba(251,191,36,0.92)" cornerRadius={8} shadowColor="rgba(0,0,0,0.3)" shadowBlur={12} shadowOffsetY={4} />
                <Text text={el.text} x={10} y={10} width={(el.width||160)-20} fontSize={13} fill="#1a1a1a" fontFamily="Inter, sans-serif" lineHeight={1.5} />
              </Group>
            );
            return null;
          })}
          {preview && (() => {
            if (preview.type === 'rect') return <Rect key="prev" x={preview.x} y={preview.y} width={preview.width} height={preview.height} stroke={preview.stroke} fill="transparent" strokeWidth={preview.strokeWidth} dash={[6,4]} />;
            if (preview.type === 'circle') return <Ellipse key="prev" x={(preview.x||0)+(preview.width||0)/2} y={(preview.y||0)+(preview.height||0)/2} radiusX={Math.abs((preview.width||0)/2)} radiusY={Math.abs((preview.height||0)/2)} stroke={preview.stroke} fill="transparent" strokeWidth={preview.strokeWidth} dash={[6,4]} />;
            if (preview.type === 'arrow') return <Arrow key="prev" points={preview.points||[]} stroke={preview.stroke} strokeWidth={preview.strokeWidth} fill={preview.stroke} pointerLength={10} pointerWidth={8} />;
            return null;
          })()}
          <Transformer ref={trRef} enabledAnchors={['top-left','top-right','bottom-left','bottom-right']} boundBoxFunc={(_, b) => b} />
        </Layer>
      </Stage>

      <div style={{ position: 'absolute', bottom: 16, left: 120, zIndex: 50 }}>
        <div style={{ background: 'rgba(14,14,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', backdropFilter: 'blur(10px)' }}>
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
}