"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";

// Lazy-load react-pdf only on the client, since it depends on the DOM/canvas.
import dynamic from "next/dynamic";
const Document = dynamic(() => import("react-pdf").then((m) => m.Document), {
  ssr: false,
});
const Page = dynamic(() => import("react-pdf").then((m) => m.Page), {
  ssr: false,
});

export default function PdfModal({
  open,
  onClose,
  fileUrl,
  title,
}: {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);

  const goTo = (delta: number) => {
    setPageNumber((p) => {
      const next = p + delta;
      if (!numPages) return p;
      return Math.min(Math.max(next, 1), numPages);
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl2 bg-white shadow-2xl dark:bg-surface-dark-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-white/5">
              <p className="truncate font-display text-sm font-medium text-slate-800 dark:text-slate-100">
                {title}
              </p>
              <button
                onClick={onClose}
                aria-label="Close preview"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-auto bg-slate-100 p-6 dark:bg-black/20">
              <div className="mx-auto flex w-fit justify-center">
                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="flex h-72 w-56 animate-pulse items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-400 dark:bg-white/5">
                      Loading page…
                    </div>
                  }
                  error={
                    <div className="flex h-72 w-56 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-400 dark:bg-white/5">
                      Couldn't load this paper.
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={zoom}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-white/5">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goTo(-1)}
                  disabled={pageNumber <= 1}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/5"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-[70px] text-center text-xs text-slate-500 dark:text-slate-400">
                  Page {pageNumber} {numPages ? `/ ${numPages}` : ""}
                </span>
                <button
                  onClick={() => goTo(1)}
                  disabled={!numPages || pageNumber >= numPages}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <a
                  href={fileUrl}
                  download
                  className="ml-1 flex items-center gap-1.5 rounded-lg bg-maroon-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-maroon-600"
                >
                  <Download size={14} /> Download
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
