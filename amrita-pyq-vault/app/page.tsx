"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Clock, Loader2 } from "lucide-react";
import PaperCard, { PaperCardData } from "@/components/PaperCard";
import { BRANCHES as BRANCH_META } from "@/lib/demoData";
import UserAnalyticsSection from "@/components/UserAnalyticsSection";

const BRANCHES = BRANCH_META.map((b) => b.code);
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const REGULATIONS = ["R2019", "R2021", "R2023"] as const;
const EXAM_TYPES = [
  { value: "MID_SEM", label: "Mid-Sem" },
  { value: "END_SEM", label: "End-Sem" },
  { value: "SUPPLEMENTARY", label: "Supplementary" },
  { value: "MODEL", label: "Model" },
] as const;

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState<string | null>(null);
  const [semester, setSemester] = useState<number | null>(null);
  const [regulation, setRegulation] = useState<string | null>(null);
  const [examType, setExamType] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [papers, setPapers] = useState<PaperCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<PaperCardData[]>([]);

  const activeFilterCount = [branch, semester, regulation, examType].filter(Boolean).length;

  useEffect(() => {
    // Load recently viewed papers from localStorage
    try {
      const stored = localStorage.getItem("recently_viewed_papers");
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recently viewed papers:", e);
    }
  }, []);

  useEffect(() => {
    async function fetchPapers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("query", query);
        if (branch) params.set("branch", branch);
        if (semester) params.set("semester", String(semester));
        if (regulation) params.set("regulation", regulation);
        if (examType) params.set("examType", examType);

        const res = await fetch(`/api/papers?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPapers(data);
        }
      } catch (err) {
        console.error("Error loading papers:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchPapers, 200);
    return () => clearTimeout(timer);
  }, [query, branch, semester, regulation, examType]);

  const clearFilters = () => {
    setBranch(null);
    setSemester(null);
    setRegulation(null);
    setExamType(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      {/* Hero / search section */}
      <section className="mb-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500">
          Amrita Vishwa Vidyapeetham
        </p>
        <h1 className="mb-3 font-display text-4xl font-semibold leading-tight text-slate-900 dark:text-slate-50 md:text-5xl">
          Find any previous paper
          <br className="hidden md:block" /> in three clicks.
        </h1>
        <p className="mb-7 max-w-xl text-sm text-slate-500 dark:text-slate-400">
          Search, preview, and download official PYQs across every department and regulation.
        </p>

        <div className="glass-card relative rounded-xl2 p-1.5 shadow-glass dark:glass-dark dark:shadow-glass-dark">
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 dark:bg-white/5">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject code or name — e.g. 23ECE211, Data Structures…"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-maroon-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-white/25 px-1.5 text-[10px]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl2 border border-slate-200 bg-white p-5 dark:border-white/5 dark:bg-white/5 sm:grid-cols-2 md:grid-cols-4">
                <FilterGroup label="Branch">
                  {BRANCHES.map((b) => (
                    <Chip
                      key={b}
                      label={b}
                      active={branch === b}
                      onClick={() => setBranch(branch === b ? null : b)}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup label="Semester">
                  {SEMESTERS.map((s) => (
                    <Chip
                      key={s}
                      label={String(s)}
                      active={semester === s}
                      onClick={() => setSemester(semester === s ? null : s)}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup label="Regulation">
                  {REGULATIONS.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      active={regulation === r}
                      onClick={() => setRegulation(regulation === r ? null : r)}
                    />
                  ))}
                </FilterGroup>

                <FilterGroup label="Exam type">
                  {EXAM_TYPES.map((e) => (
                    <Chip
                      key={e.value}
                      label={e.label}
                      active={examType === e.value}
                      onClick={() => setExamType(examType === e.value ? null : e.value)}
                    />
                  ))}
                </FilterGroup>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-maroon-500 hover:underline"
                >
                  <X size={12} /> Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* User Performance Analytics & Questions Counters */}
      <UserAnalyticsSection />

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && !query && activeFilterCount === 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Clock size={16} className="text-maroon-500" />
            <h2 className="font-display text-base font-medium text-slate-800 dark:text-slate-100">
              Recently Viewed Papers
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyViewed.slice(0, 3).map((paper) => (
              <PaperCard key={`recent-${paper.id}`} paper={paper} />
            ))}
          </div>
        </section>
      )}

      {/* Results Section */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-slate-800 dark:text-slate-100">
            {loading ? "Searching..." : `${papers.length} ${papers.length === 1 ? "paper" : "papers"} found`}
          </h2>
        </div>

        {loading ? (
          <div className="flex py-20 justify-center items-center gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin text-maroon-500" />
            <span className="text-sm">Loading question papers…</span>
          </div>
        ) : papers.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-slate-300 py-16 text-center dark:border-white/10">
            <p className="font-display text-base text-slate-600 dark:text-slate-300">
              No papers match those filters yet.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Try clearing a filter, or upload a paper for this subject.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper, i) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <PaperCard paper={paper} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-indigo-500 bg-indigo-500 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-white/10 dark:bg-transparent dark:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
