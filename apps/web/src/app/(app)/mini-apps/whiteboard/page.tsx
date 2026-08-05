'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

export default function WhiteboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#dfff00');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [boardBg, setBoardBg] = useState<'dark' | 'light'>('dark');

  const getCanvasBgColor = () => (boardBg === 'dark' ? '#0a0a0c' : '#ffffff');

  const initBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 900;
    canvas.height = 550;

    ctx.fillStyle = getCanvasBgColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    initBoard();
    window.addEventListener('resize', initBoard);
    return () => window.removeEventListener('resize', initBoard);
  }, [boardBg]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = tool === 'eraser' ? getCanvasBgColor() : strokeColor;
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 5 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = getCanvasBgColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'weeverything-whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="CANVAS UTILITY & ARCHITECTURE DIAGRAMS"
        title="Interactive Whiteboard"
        description="Sketch ideas, diagram architectures, draw freehand & export high-resolution PNG"
        actions={
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setBoardBg(boardBg === 'dark' ? 'light' : 'dark')}
              className="btn-glass border border-[var(--color-border)] px-4 py-2.5 rounded-xl font-mono text-xs uppercase font-bold cursor-pointer"
            >
              Canvas: {boardBg === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <button
              onClick={clearCanvas}
              className="btn-glass border border-[var(--color-border)] hover:border-red-400 px-4 py-2.5 rounded-xl font-mono text-xs uppercase font-bold cursor-pointer"
            >
              Clear Board
            </button>
            <button
              onClick={downloadCanvas}
              className="btn-neon px-5 py-2.5 font-mono text-xs uppercase font-bold cursor-pointer"
            >
              Export Image
            </button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer font-bold ${
              tool === 'pen' ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]' : 'bg-[var(--color-surface-dim)] text-[var(--color-text-muted)] border-[var(--color-border)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">edit</span> Pen
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2.5 rounded-lg border flex items-center gap-1.5 cursor-pointer font-bold ${
              tool === 'eraser' ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]' : 'bg-[var(--color-surface-dim)] text-[var(--color-text-muted)] border-[var(--color-border)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">ink_eraser</span> Eraser
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-bold">Color:</span>
          {['#dfff00', '#ffffff', '#000000', '#3b82f6', '#ef4444', '#10b981', '#a855f7'].map((c) => (
            <button
              key={c}
              onClick={() => {
                setStrokeColor(c);
                setTool('pen');
              }}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${strokeColor === c && tool === 'pen' ? 'border-[var(--color-text)] scale-110 shadow-md' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Thickness */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-text-muted)] text-[10px] uppercase font-bold">Stroke:</span>
          {[2, 4, 8, 14].map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={`w-8 h-8 rounded-lg border font-bold flex items-center justify-center cursor-pointer ${
                strokeWidth === w ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]' : 'bg-[var(--color-surface-dim)] text-[var(--color-text-muted)] border-[var(--color-border)]'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xl relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full cursor-crosshair block"
        />
      </div>
    </div>
  );
}
