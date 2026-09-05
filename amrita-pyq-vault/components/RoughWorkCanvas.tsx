"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
} from "lucide-react";

interface RoughWorkCanvasProps {
  questionId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  tool: "pen" | "eraser";
  color: string;
  size: number;
  points: StrokePoint[];
}

const COLORS = [
  { name: "White/Dark", value: "#F8FAFC" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Emerald", value: "#10B981" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Amber", value: "#F59E0B" },
];

const SIZES = [
  { label: "Fine", value: 2 },
  { label: "Medium", value: 4 },
  { label: "Thick", value: 8 },
];

export default function RoughWorkCanvas({
  questionId,
  isOpen,
  onClose,
}: RoughWorkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#6366F1");
  const [size, setSize] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const isDrawing = useRef(false);
  const currentStroke = useRef<Stroke | null>(null);

  // Load saved strokes for this questionId
  useEffect(() => {
    if (!questionId) return;
    try {
      const saved = localStorage.getItem(`jee_roughwork_${questionId}`);
      if (saved) {
        const parsed: Stroke[] = JSON.parse(saved);
        setStrokes(parsed);
      } else {
        setStrokes([]);
      }
      setRedoStack([]);
    } catch (e) {
      console.error("Failed to load rough work:", e);
    }
  }, [questionId]);

  // Save strokes when updated
  useEffect(() => {
    if (!questionId) return;
    try {
      localStorage.setItem(`jee_roughwork_${questionId}`, JSON.stringify(strokes));
    } catch (e) {
      console.error("Failed to save rough work:", e);
    }
  }, [strokes, questionId]);

  // Redraw canvas whenever strokes change or window resizes
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background lines (like notebook paper)
    ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
    ctx.lineWidth = 1;
    const step = 28;
    for (let y = step; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render strokes
    strokes.forEach((s) => {
      if (s.points.length < 1) return;
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (s.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = s.size * 3;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
      }

      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
    });

    ctx.globalCompositeOperation = "source-over";
  };

  useEffect(() => {
    redraw();
  }, [strokes, isOpen, isFullscreen]);

  // Resize canvas to match display size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 450;
        redraw();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, isFullscreen]);

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    const pos = getCanvasPos(e);
    const newStroke: Stroke = {
      tool,
      color,
      size,
      points: [pos],
    };
    currentStroke.current = newStroke;
    setStrokes((prev) => [...prev, newStroke]);
    setRedoStack([]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    currentStroke.current.points.push(pos);
    setStrokes((prev) => {
      const next = [...prev];
      next[next.length - 1] = { ...currentStroke.current! };
      return next;
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    canvasRef.current?.releasePointerCapture(e.pointerId);
    isDrawing.current = false;
    currentStroke.current = null;
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setRedoStack((prev) => [...prev, last]);
    setStrokes((prev) => prev.slice(0, prev.length - 1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setStrokes((prev) => [...prev, last]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClear = () => {
    if (strokes.length === 0) return;
    if (confirm("Clear all rough work for this question?")) {
      setStrokes([]);
      setRedoStack([]);
      localStorage.removeItem(`jee_roughwork_${questionId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`relative flex flex-col rounded-xl2 border border-slate-700 bg-slate-950/95 text-slate-100 shadow-2xl transition-all ${
        isFullscreen
          ? "fixed inset-2 z-50 h-[calc(100vh-16px)]"
          : "h-[500px] w-full"
      }`}
    >
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 p-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-maroon-400" />
          <span className="font-display text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Digital Rough Notebook
          </span>
        </div>

        {/* Tools & Palette */}
        <div className="flex items-center gap-3">
          {/* Pen / Eraser Switch */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setTool("pen")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tool === "pen"
                  ? "bg-maroon-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Pencil size={13} /> Pen
            </button>
            <button
              type="button"
              onClick={() => setTool("eraser")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tool === "eraser"
                  ? "bg-maroon-500 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eraser size={13} /> Eraser
            </button>
          </div>

          {/* Color Palette */}
          {tool === "pen" && (
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`h-5 w-5 rounded-full transition-transform ${
                    color === c.value
                      ? "ring-2 ring-maroon-400 ring-offset-2 ring-offset-slate-950 scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          )}

          {/* Size Palette */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            {SIZES.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSize(s.value)}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  size === s.value
                    ? "bg-slate-800 text-maroon-400 font-semibold"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Undo / Redo / Clear */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              title="Undo"
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo"
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40"
            >
              <RotateCw size={14} />
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={strokes.length === 0}
              title="Clear Canvas"
              className="rounded p-1.5 text-red-400 hover:bg-red-500/20 disabled:opacity-40"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Fullscreen & Close */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Rough Work"
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 cursor-crosshair overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="h-full w-full bg-slate-950"
        />
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between border-t border-slate-800/80 px-3 py-1.5 text-[10px] text-slate-500">
        <span>✏️ Scratchpad auto-saves for Question ID: {questionId}</span>
        <span>Touch / Mouse / Stylus Supported</span>
      </div>
    </div>
  );
}
