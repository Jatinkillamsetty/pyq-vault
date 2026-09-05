"use client";

import Link from "next/link";
import { Home, Target, LayoutGrid, Bot, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-maroon-500/20 to-indigo-500/20 blur-xl dark:from-maroon-500/30 dark:to-indigo-500/30" />
        <span className="relative font-display text-8xl font-black tracking-tight text-slate-900 dark:text-white md:text-9xl">
          404
        </span>
      </div>

      <h1 className="mb-3 font-display text-2xl font-bold text-slate-800 dark:text-slate-100 md:text-3xl">
        Page Not Found
      </h1>
      <p className="mb-8 max-w-md text-sm text-slate-500 dark:text-slate-400">
        The page you are looking for doesn&apos;t exist or has been moved. Explore these sections instead:
      </p>

      <div className="mb-10 grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3.5 text-left text-slate-700 shadow-sm transition hover:border-maroon-500/40 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-maroon-500/40 dark:hover:bg-white/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-maroon-500/10 text-maroon-500 dark:bg-maroon-500/20 dark:text-maroon-400">
            <Home size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold">Home Vault</div>
            <div className="text-[11px] text-slate-400">Main search & dashboard</div>
          </div>
        </Link>

        <Link
          href="/jee-practice"
          className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3.5 text-left text-slate-700 shadow-sm transition hover:border-indigo-500/40 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:bg-white/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Target size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold">JEE PYQs & Canvas</div>
            <div className="text-[11px] text-slate-400">Practice & rough work</div>
          </div>
        </Link>

        <Link
          href="/browse"
          className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3.5 text-left text-slate-700 shadow-sm transition hover:border-emerald-500/40 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-500/40 dark:hover:bg-white/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
            <LayoutGrid size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold">Browse Syllabus</div>
            <div className="text-[11px] text-slate-400">Physics, Chemistry, Math</div>
          </div>
        </Link>

        <Link
          href="/ai"
          className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/70 p-3.5 text-left text-slate-700 shadow-sm transition hover:border-amber-500/40 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-amber-500/40 dark:hover:bg-white/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400">
            <Bot size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold">PYQ AI Assistant</div>
            <div className="text-[11px] text-slate-400">Ask questions & solve PYQs</div>
          </div>
        </Link>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}
