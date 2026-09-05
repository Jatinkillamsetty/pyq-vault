"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, CheckCircle2, Layers, Repeat, Loader2 } from "lucide-react";

interface SubjectOption {
  id: string;
  code: string;
  name: string;
  branch: string;
}

interface TopicAnalysis {
  topic: string;
  frequency: number;
  totalMarks: number;
  years: number[];
  units: number[];
  priorityTier: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  sampleQuestions: string[];
}

interface AnalysisData {
  subject: {
    code: string;
    name: string;
    branch: string;
    semester: number;
  };
  totalPapersAnalyzed: number;
  totalQuestionsAnalyzed: number;
  priorityBreakdown: {
    high: TopicAnalysis[];
    medium: TopicAnalysis[];
    low: TopicAnalysis[];
  };
  unitDistribution: { unit: number; questionCount: number; totalMarks: number }[];
}

interface RepeatedMatch {
  similarity: number;
  topic: string;
  questionA: { id: string; text: string; questionNo: string; year: number; marks?: number };
  questionB: { id: string; text: string; questionNo: string; year: number; marks?: number };
}

export default function CheatsheetsPage() {
  const DEFAULT_JEE_SUBJECTS: SubjectOption[] = [
    { id: "jee-phy", code: "JEE_PHYSICS", name: "🔵 JEE Physics (24 Chapters)", branch: "JEE" },
    { id: "jee-chem", code: "JEE_CHEMISTRY", name: "🟢 JEE Chemistry (32 Chapters)", branch: "JEE" },
    { id: "jee-math", code: "JEE_MATHEMATICS", name: "🔴 JEE Mathematics (18 Chapters)", branch: "JEE" },
  ];

  const [subjects, setSubjects] = useState<SubjectOption[]>(DEFAULT_JEE_SUBJECTS);
  const [activeCode, setActiveCode] = useState<string>("JEE_PHYSICS");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [repeatedClusters, setRepeatedClusters] = useState<RepeatedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch("/api/subjects");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSubjects([...DEFAULT_JEE_SUBJECTS, ...data]);
          }
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    }
    loadSubjects();
  }, []);

  useEffect(() => {
    if (!activeCode) return;

    async function loadAnalysis() {
      setLoading(true);
      try {
        const [resAnalysis, resRepeated] = await Promise.all([
          fetch(`/api/ai/analysis?subjectCode=${activeCode}`),
          fetch(`/api/ai/repeated-questions?subjectCode=${activeCode}`),
        ]);

        if (resAnalysis.ok) {
          const data = await resAnalysis.json();
          setAnalysis(data);
        }

        if (resRepeated.ok) {
          const data = await resRepeated.json();
          setRepeatedClusters(data.clusters || []);
        }
      } catch (e) {
        console.error("Error loading subject analysis:", e);
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [activeCode]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <section className="mb-10">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-indigo-500">
          <Sparkles size={13} /> AI Data Analysis & Repeated Detection
        </p>
        <h1 className="mb-3 font-display text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-50 md:text-4xl">
          PYQ Analysis & Topic Priorities
        </h1>
        <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
          Data-driven question importance, repeated question vector detection, and unit distribution calculated from real past papers.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Subject Picker */}
        <aside className="flex flex-col gap-2">
          {subjects.map((s) => {
            const active = s.code === activeCode;
            return (
              <button
                key={s.id || s.code}
                onClick={() => setActiveCode(s.code)}
                className={`rounded-xl border p-3.5 text-left transition-colors ${
                  active
                    ? "border-maroon-500 bg-maroon-500/5 dark:bg-maroon-500/10"
                    : "border-slate-200 bg-white hover:border-indigo-300 dark:border-white/5 dark:bg-white/[0.03] dark:hover:border-indigo-400/40"
                }`}
              >
                <p className="font-mono text-[11px] font-semibold text-slate-400">{s.code}</p>
                <p className="line-clamp-2 font-display text-sm font-medium text-slate-800 dark:text-slate-100">
                  {s.name}
                </p>
              </button>
            );
          })}
        </aside>

        {/* Detailed Analytics */}
        <section>
          {loading ? (
            <div className="flex py-24 justify-center items-center gap-2 text-slate-400">
              <Loader2 size={24} className="animate-spin text-maroon-500" />
              <span>Analyzing PYQ database with AI vector pipeline…</span>
            </div>
          ) : analysis ? (
            <motion.div
              key={activeCode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header card */}
              <div className="rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-maroon-500">{analysis.subject.code}</span>
                  <span className="text-xs text-slate-400">
                    Based on {analysis.totalPapersAnalyzed} paper(s) & {analysis.totalQuestionsAnalyzed} question(s)
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {analysis.subject.name}
                </h2>
              </div>

              {/* Priority Tiers */}
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Important Question Priority Tiers
                </h3>

                {/* HIGH PRIORITY */}
                {analysis.priorityBreakdown.high.length > 0 && (
                  <div className="rounded-xl2 border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 size={16} /> HIGH PRIORITY TOPICS
                    </div>
                    <div className="space-y-3">
                      {analysis.priorityBreakdown.high.map((t) => (
                        <div key={t.topic} className="rounded-xl bg-white p-3.5 shadow-sm dark:bg-white/5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {t.topic}
                            </h4>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              {t.frequency}x Asked
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MEDIUM PRIORITY */}
                {analysis.priorityBreakdown.medium.length > 0 && (
                  <div className="rounded-xl2 border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                      <TrendingUp size={16} /> MEDIUM PRIORITY TOPICS
                    </div>
                    <div className="space-y-3">
                      {analysis.priorityBreakdown.medium.map((t) => (
                        <div key={t.topic} className="rounded-xl bg-white p-3.5 shadow-sm dark:bg-white/5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {t.topic}
                            </h4>
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                              {t.frequency}x Asked
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* REPEATED QUESTION VECTOR DETECTION */}
              <div className="rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="mb-4 flex items-center gap-2">
                  <Repeat size={18} className="text-maroon-500" />
                  <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Repeated Question Detection (Vector Cosine Similarity)
                  </h3>
                </div>

                {repeatedClusters.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No repeated question pairs detected above similarity threshold yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {repeatedClusters.map((match, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="rounded-md bg-maroon-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-maroon-500 dark:bg-maroon-500/20 dark:text-maroon-400">
                            {match.similarity}% Vector Similarity
                          </span>
                          <span className="text-xs text-slate-400">Topic: {match.topic}</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-lg bg-white p-3 dark:bg-white/5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              {match.questionA.year} Exam ({match.questionA.questionNo})
                            </p>
                            <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                              "{match.questionA.text}"
                            </p>
                          </div>
                          <div className="rounded-lg bg-white p-3 dark:bg-white/5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              {match.questionB.year} Exam ({match.questionB.questionNo})
                            </p>
                            <p className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                              "{match.questionB.text}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unit-wise Distribution */}
              <div className="rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-indigo-500" />
                  <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Unit-wise Question Distribution
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                  {analysis.unitDistribution.map((u) => (
                    <div
                      key={u.unit}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-white/5 dark:bg-white/5"
                    >
                      <p className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Unit {u.unit}
                      </p>
                      <p className="mt-1 text-lg font-bold text-maroon-500">{u.questionCount}</p>
                      <p className="text-[11px] text-slate-400">Questions</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-xl2 border border-dashed border-slate-300 py-16 text-center dark:border-white/10">
              <p className="text-sm text-slate-400">No data available for this subject.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
