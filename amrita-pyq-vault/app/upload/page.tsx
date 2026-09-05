"use client";

import { useState, FormEvent, useMemo } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Sparkles, BookOpen, Plus, Target, ArrowRight } from "lucide-react";
import { SUBJECT_DATA } from "@/lib/demoData";
import { addCustomQuestionToStorage, JeeQuestion } from "@/lib/jeeData";
import Link from "next/link";

export default function UploadQuestionPage() {
  const [subject, setSubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");
  const [chapter, setChapter] = useState<string>("");
  const [customChapter, setCustomChapter] = useState<string>("");
  const [subtopic, setSubtopic] = useState<string>("");
  const [exam, setExam] = useState<"JEE Main" | "JEE Advanced">("JEE Main");
  const [year, setYear] = useState<number>(2025);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const [questionText, setQuestionText] = useState<string>("");
  const [optA, setOptA] = useState<string>("");
  const [optB, setOptB] = useState<string>("");
  const [optC, setOptC] = useState<string>("");
  const [optD, setOptD] = useState<string>("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [solutionText, setSolutionText] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [submittedQuestion, setSubmittedQuestion] = useState<JeeQuestion | null>(null);

  // Available chapters based on subject
  const availableChapters = useMemo(() => {
    if (subject === "Physics") return SUBJECT_DATA.Physics;
    if (subject === "Mathematics") return SUBJECT_DATA.Mathematics;
    return [
      ...SUBJECT_DATA.Chemistry["Physical Chemistry"],
      ...SUBJECT_DATA.Chemistry["Inorganic Chemistry"],
      ...SUBJECT_DATA.Chemistry["Organic Chemistry"],
    ];
  }, [subject]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetChapter = chapter === "__CUSTOM__" ? customChapter.trim() : chapter.trim();

    if (!targetChapter) {
      setError("Please select or enter a chapter name.");
      return;
    }
    if (!questionText.trim()) {
      setError("Please enter the question statement.");
      return;
    }
    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setError("Please fill out all four options (A, B, C, and D).");
      return;
    }
    if (!solutionText.trim()) {
      setError("Please provide a step-by-step solution for students.");
      return;
    }

    const newQuestion: JeeQuestion = {
      id: `custom-user-q-${Date.now()}`,
      subject,
      chapter: targetChapter,
      subtopic: subtopic.trim() || `${targetChapter} Practice`,
      exam,
      year,
      difficulty,
      question: questionText.trim(),
      options: [
        { id: "A", text: optA.trim() },
        { id: "B", text: optB.trim() },
        { id: "C", text: optC.trim() },
        { id: "D", text: optD.trim() },
      ],
      correctOption,
      solution: solutionText.trim(),
    };

    addCustomQuestionToStorage(newQuestion);
    setSubmittedQuestion(newQuestion);
    setSuccess(true);
  };

  const handleResetForm = () => {
    setQuestionText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setSolutionText("");
    setSubtopic("");
    setSuccess(false);
    setSubmittedQuestion(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500 flex items-center gap-1.5">
          <UploadCloud size={14} /> JEE Question Bank Contribution
        </p>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 md:text-4xl">
          Upload Practice Question
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Add custom JEE Main & Advanced questions to any chapter for all students to practice.
        </p>
      </div>

      {success && submittedQuestion ? (
        <div className="glass-card rounded-xl2 p-8 shadow-glass dark:glass-dark text-center border border-emerald-500/20 bg-emerald-500/5">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
            Question Live & Saved!
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Your question has been added to <span className="font-semibold text-maroon-500">{submittedQuestion.subject} — {submittedQuestion.chapter}</span>.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleResetForm}
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
            >
              <Plus size={16} /> Add Another Question
            </button>
            <Link
              href={`/jee-practice?subject=${encodeURIComponent(submittedQuestion.subject)}&chapter=${encodeURIComponent(submittedQuestion.chapter)}`}
              className="flex items-center gap-2 rounded-xl bg-maroon-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-maroon-600 shadow-md"
            >
              <Target size={16} /> Practice Chapter PYQs <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-medium text-maroon-600 dark:bg-red-500/10 dark:text-maroon-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Subject & Chapter */}
          <div className="glass-card rounded-xl2 p-6 shadow-glass dark:glass-dark space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen size={18} className="text-maroon-500" /> Subject & Chapter Mapping
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Select Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value as any);
                    setChapter("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Select Chapter *
                </label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                >
                  <option value="">-- Choose Chapter --</option>
                  {availableChapters.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Enter Custom Chapter</option>
                </select>
              </div>
            </div>

            {chapter === "__CUSTOM__" && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Custom Chapter Name *
                </label>
                <input
                  value={customChapter}
                  onChange={(e) => setCustomChapter(e.target.value)}
                  placeholder="e.g. Waves, Ionic Equilibrium, Matrices..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Subtopic / Topic Tag (Optional)
              </label>
              <input
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g. Projectile Motion, Bohr Model, Limits..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
              />
            </div>
          </div>

          {/* Section 2: Metadata */}
          <div className="glass-card rounded-xl2 p-6 shadow-glass dark:glass-dark space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" /> Exam Details & Difficulty
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Exam Type
                </label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                >
                  <option value="JEE Main">JEE Main</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Exam Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                >
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Question & Options */}
          <div className="glass-card rounded-xl2 p-6 shadow-glass dark:glass-dark space-y-4">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Question Statement & Options
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Question Statement *
              </label>
              <textarea
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter complete question statement (e.g. A particle of mass m moves under a central force...)"
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Option (A) *
                </label>
                <input
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  placeholder="Value / Answer A"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Option (B) *
                </label>
                <input
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  placeholder="Value / Answer B"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Option (C) *
                </label>
                <input
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  placeholder="Value / Answer C"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Option (D) *
                </label>
                <input
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  placeholder="Value / Answer D"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Correct Option *
              </label>
              <div className="flex items-center gap-6">
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <input
                      type="radio"
                      name="correctOption"
                      value={opt}
                      checked={correctOption === opt}
                      onChange={() => setCorrectOption(opt)}
                      className="text-maroon-500 focus:ring-maroon-500"
                    />
                    Option ({opt})
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Step-by-Step Solution & Explanation *
              </label>
              <textarea
                rows={4}
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Provide complete formulas, steps, and explanations to solve this question."
                className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-maroon-500 py-3 text-sm font-medium text-white transition-colors hover:bg-maroon-600 shadow-md"
          >
            <UploadCloud size={18} /> Submit Question to Chapter
          </button>
        </form>
      )}
    </div>
  );
}
