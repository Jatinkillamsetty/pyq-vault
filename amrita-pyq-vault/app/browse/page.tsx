"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Loader2, BookOpen, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import PaperCard, { PaperCardData } from "@/components/PaperCard";
import { SUBJECT_DATA } from "@/lib/demoData";

const CATEGORY_META = [
  {
    key: "Physics",
    title: "🔵 Physics",
    badge: "24 Topics",
    color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30",
    topics: SUBJECT_DATA.Physics,
  },
  {
    key: "Chemistry",
    title: "🟢 Chemistry",
    badge: "32 Topics",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30",
    sections: [
      { name: "Physical Chemistry", topics: SUBJECT_DATA.Chemistry["Physical Chemistry"] },
      { name: "Inorganic Chemistry", topics: SUBJECT_DATA.Chemistry["Inorganic Chemistry"] },
      { name: "Organic Chemistry", topics: SUBJECT_DATA.Chemistry["Organic Chemistry"] },
    ],
  },
  {
    key: "Mathematics",
    title: "🔴 Mathematics",
    badge: "28 Topics",
    color: "from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-200 dark:border-rose-500/30",
    topics: SUBJECT_DATA.Mathematics,
  },
  {
    key: "CSE",
    title: "💻 Computer Science",
    badge: "Engineering",
    color: "from-purple-500/10 to-indigo-500/10 text-purple-600 border-purple-200 dark:border-purple-500/30",
  },
  {
    key: "ECE",
    title: "⚡ ECE / EEE",
    badge: "Engineering",
    color: "from-amber-500/10 to-yellow-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30",
  },
  {
    key: "MECH",
    title: "⚙️ Mechanical",
    badge: "Engineering",
    color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-500/30",
  },
];

export default function BrowseByBranchPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>("Physics");
  const [expandedSection, setExpandedSection] = useState<string | null>("Physical Chemistry");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [allPapers, setAllPapers] = useState<PaperCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllPapers() {
      try {
        const res = await fetch("/api/papers");
        if (res.ok) {
          const data = await res.json();
          setAllPapers(data);
        }
      } catch (e) {
        console.error("Error loading papers for branch view:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAllPapers();
  }, []);

  const results = useMemo(() => {
    if (!allPapers.length) return [];
    if (!activeCategory) return allPapers;
    const catLower = activeCategory.toLowerCase();

    if (selectedTopic) {
      const topLower = selectedTopic.toLowerCase();
      const topicMatches = allPapers.filter(
        (p) =>
          p.subjectName?.toLowerCase().includes(topLower) ||
          p.topTopic?.toLowerCase().includes(topLower)
      );
      if (topicMatches.length > 0) return topicMatches;
    }

    let filtered = allPapers.filter((p) => {
      const branchLower = (p.branch || "").toLowerCase();
      const subjectLower = (p.subjectName || "").toLowerCase();
      const topicLower = (p.topTopic || "").toLowerCase();

      if (catLower === "chemistry") {
        return (
          branchLower.includes("chem") ||
          subjectLower.includes("chem") ||
          topicLower.includes("chem")
        );
      }
      if (catLower === "physics") {
        return (
          branchLower.includes("phys") ||
          subjectLower.includes("phys") ||
          topicLower.includes("phys") ||
          branchLower === "mech"
        );
      }
      if (catLower === "mathematics") {
        return (
          branchLower.includes("math") ||
          subjectLower.includes("math") ||
          topicLower.includes("math")
        );
      }
      return branchLower === catLower || branchLower.includes(catLower);
    });

    return filtered.length > 0 ? filtered : allPapers;
  }, [activeCategory, selectedTopic, allPapers]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <section className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500">
          Amrita Vishwa Vidyapeetham
        </p>
        <h1 className="mb-3 font-display text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-50 md:text-4xl">
          Browse Subject Syllabus & PYQs
        </h1>
        <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
          Explore complete topic units for Physics, Chemistry (Physical, Inorganic, Organic), and Mathematics with past exam papers.
        </p>
      </section>

      {/* Main 3 Category Tabs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATEGORY_META.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setSelectedTopic(null);
              }}
              className={`flex items-center justify-between rounded-xl2 border p-5 transition-all text-left ${
                isActive
                  ? "border-maroon-500 bg-maroon-500/5 shadow-md dark:bg-maroon-500/10 dark:border-maroon-400"
                  : "border-slate-200 bg-white hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.03]"
              }`}
            >
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                  {cat.title}
                </h2>
                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {cat.badge}
                </span>
              </div>
              <ChevronRight
                size={20}
                className={`transition-transform ${
                  isActive ? "rotate-90 text-maroon-500" : "text-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Topic List / Unit Accordion */}
      {activeCategory && (
        <section className="mb-12 rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-800 dark:text-slate-100">
              <BookOpen size={18} className="text-maroon-500" />
              Syllabus Units & Topics ({activeCategory})
            </h2>
            <div className="flex items-center gap-3">
              {selectedTopic && (
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-xs text-maroon-500 hover:underline font-medium"
                >
                  Clear topic filter
                </button>
              )}
              <Link
                href={`/jee-practice?subject=${encodeURIComponent(activeCategory)}&chapter=${encodeURIComponent(selectedTopic || "")}`}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-maroon-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <Target size={14} />
                Practice Chapter PYQs
              </Link>
            </div>
          </div>

          {activeCategory === "Chemistry" ? (
            <div className="space-y-4">
              {CATEGORY_META.find((c) => c.key === "Chemistry")?.sections?.map((sec) => {
                const isOpen = expandedSection === sec.name;
                return (
                  <div
                    key={sec.name}
                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"
                  >
                    <button
                      onClick={() => setExpandedSection(isOpen ? null : sec.name)}
                      className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left font-display text-sm font-semibold text-slate-800 dark:bg-white/5 dark:text-slate-200"
                    >
                      <span>{sec.name} ({sec.topics.length} Units)</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isOpen ? "rotate-180 text-maroon-500" : "text-slate-400"}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sec.topics.map((t) => {
                          const isSel = selectedTopic === t;
                          return (
                            <div
                              key={t}
                              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                                isSel
                                  ? "border-maroon-500 bg-maroon-500/10 text-maroon-700 dark:text-maroon-300 font-semibold"
                                  : "border-slate-100 bg-white text-slate-700 hover:border-indigo-300 dark:border-white/5 dark:bg-white/5 dark:text-slate-300"
                              }`}
                            >
                              <button
                                onClick={() => setSelectedTopic(isSel ? null : t)}
                                className="flex-1 truncate text-left"
                              >
                                {t}
                              </button>
                              <Link
                                href={`/jee-practice?subject=Chemistry&chapter=${encodeURIComponent(t.replace(/^\d+\.\s*/, ""))}`}
                                className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 transition hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white"
                                title={`Practice ${t} PYQs`}
                              >
                                Practice →
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORY_META.find((c) => c.key === activeCategory)?.topics?.map((t, idx) => {
                const isSel = selectedTopic === t;
                return (
                  <div
                    key={t}
                    className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                      isSel
                        ? "border-maroon-500 bg-maroon-500/10 text-maroon-700 dark:text-maroon-300 font-semibold shadow-sm"
                        : "border-slate-100 bg-white text-slate-700 hover:border-indigo-300 dark:border-white/5 dark:bg-white/5 dark:text-slate-300"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedTopic(isSel ? null : t)}
                      className="flex flex-1 items-center gap-2 overflow-hidden text-left"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                        {idx + 1}
                      </span>
                      <span className="truncate">{t}</span>
                    </button>
                    <Link
                      href={`/jee-practice?subject=${encodeURIComponent(activeCategory || "Physics")}&chapter=${encodeURIComponent(t)}`}
                      className="shrink-0 rounded-lg bg-maroon-500/10 px-2 py-1 text-[11px] font-semibold text-maroon-600 transition hover:bg-maroon-500 hover:text-white dark:bg-maroon-500/20 dark:text-maroon-300 dark:hover:bg-maroon-500 dark:hover:text-white"
                      title={`Practice ${t} PYQs`}
                    >
                      Practice →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Filtered Papers Results */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
            {activeCategory} Question Papers ({results.length})
            {selectedTopic && <span className="text-xs font-normal text-slate-400"> — Filtered by "{selectedTopic}"</span>}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 size={24} className="animate-spin text-maroon-500" />
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-slate-300 py-16 text-center dark:border-white/10">
            <p className="font-display text-base text-slate-600 dark:text-slate-300">
              No papers uploaded for {activeCategory} {selectedTopic ? `(${selectedTopic})` : ""} yet.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Be the first to upload one for this subject!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((paper, i) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <PaperCard
                  paper={paper}
                  onDelete={(deletedId) =>
                    setAllPapers((prev) => prev.filter((p) => p.id !== deletedId))
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
