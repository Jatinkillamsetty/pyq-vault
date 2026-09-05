"use client";

import { useState, FormEvent } from "react";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Send,
  ShieldAlert,
} from "lucide-react";
import { SUBJECT_DATA } from "@/lib/demoData";

const CHAPTER_OPTIONS = [
  ...SUBJECT_DATA.Physics.map((ch) => ({ subject: "Physics", chapter: ch })),
  ...SUBJECT_DATA.Chemistry["Physical Chemistry"].map((ch) => ({
    subject: "Chemistry",
    chapter: ch,
  })),
  ...SUBJECT_DATA.Chemistry["Inorganic Chemistry"].map((ch) => ({
    subject: "Chemistry",
    chapter: ch,
  })),
  ...SUBJECT_DATA.Chemistry["Organic Chemistry"].map((ch) => ({
    subject: "Chemistry",
    chapter: ch,
  })),
  ...SUBJECT_DATA.Mathematics.map((ch) => ({
    subject: "Mathematics",
    chapter: ch,
  })),
];

export default function UploadQuestionPage() {
  const [subject, setSubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");
  const [chapter, setChapter] = useState(SUBJECT_DATA.Physics[0] || "");
  const [subtopic, setSubtopic] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [solution, setSolution] = useState("");
  const [exam, setExam] = useState("JEE Main");
  const [year, setYear] = useState(new Date().getFullYear());
  const [difficulty, setDifficulty] = useState("Medium");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableChapters = CHAPTER_OPTIONS.filter((c) => c.subject === subject);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          chapter: chapter || availableChapters[0]?.chapter || "General",
          subtopic,
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption,
          solution,
          exam,
          year: Number(year),
          difficulty,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to submit question. Please try again.");
        return;
      }

      setSuccessMsg(
        "Question submitted successfully! It has been sent to the Admin for approval before going live."
      );
      // Clear question form
      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setSolution("");
      setSubtopic("");
    } catch {
      setLoading(false);
      setErrorMsg("Network error occurred while submitting the question.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-maroon-50 px-3 py-1 text-xs font-semibold text-maroon-600 dark:bg-maroon-500/10 dark:text-maroon-400">
          <HelpCircle size={14} /> Contribute to PYQ Vault
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 md:text-4xl">
          Upload Question
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Submit new practice or previous year questions chapter-wise. All questions undergo Admin verification before appearing in the PYQ bank.
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-8 flex items-start gap-3 rounded-xl2 border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
        <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
          <span className="font-bold">Admin Moderation Required:</span> Your submitted question will remain in <span className="font-semibold text-amber-600 dark:text-amber-400">PENDING</span> status until verified and approved by an Admin.
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
          <h2 className="mb-4 font-display text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen size={18} className="text-maroon-500" /> Categorization & Metadata
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Subject */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  const s = e.target.value as any;
                  setSubject(s);
                  const firstCh = CHAPTER_OPTIONS.find((c) => c.subject === s)?.chapter || "";
                  setChapter(firstCh);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                <option value="Physics">🔵 Physics</option>
                <option value="Chemistry">🟢 Chemistry</option>
                <option value="Mathematics">🔴 Mathematics</option>
              </select>
            </div>

            {/* Chapter */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Chapter *
              </label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                {availableChapters.map((c) => (
                  <option key={c.chapter} value={c.chapter}>
                    {c.chapter}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtopic */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Subtopic (Optional)
              </label>
              <input
                type="text"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g. Projectile Motion on Incline"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Exam */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Exam / Paper Type
              </label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                <option value="JEE Main">JEE Main</option>
                <option value="JEE Advanced">JEE Advanced</option>
                <option value="University Mid-Sem">University Mid-Sem</option>
                <option value="University End-Sem">University End-Sem</option>
                <option value="Practice Question">Practice Question</option>
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                {Array.from({ length: 12 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question Text */}
        <div className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
            Question Text *
          </label>
          <textarea
            required
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type or paste the complete question statement here..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          />
        </div>

        {/* Options Grid */}
        <div className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
          <h2 className="mb-4 font-display text-base font-semibold text-slate-800 dark:text-slate-100">
            Options & Correct Answer *
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Option A *
              </label>
              <input
                required
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="Content for Option A"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Option B *
              </label>
              <input
                required
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="Content for Option B"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Option C *
              </label>
              <input
                required
                type="text"
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                placeholder="Content for Option C"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Option D *
              </label>
              <input
                required
                type="text"
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                placeholder="Content for Option D"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              Select Correct Option *
            </label>
            <div className="flex items-center gap-3">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCorrectOption(opt)}
                  className={`flex h-10 w-16 items-center justify-center rounded-xl font-bold text-sm transition-all ${
                    correctOption === opt
                      ? "bg-emerald-500 text-white shadow-glow-emerald"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  }`}
                >
                  Option {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
          <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" /> Step-by-Step Solution / Hint *
          </label>
          <textarea
            required
            rows={4}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Explain the step-by-step formula, reasoning, or derivation for students..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-maroon-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-glow-maroon transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Question for Approval
          </button>
        </div>
      </form>
    </div>
  );
}
