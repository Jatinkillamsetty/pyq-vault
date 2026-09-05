"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PenTool,
  RotateCcw,
  Sparkles,
  BookOpen,
  Filter,
  BarChart3,
  Check,
  X,
  Target,
} from "lucide-react";
import { JEE_PYQS, JeeQuestion, getChapterPyqStats } from "@/lib/jeeData";
import { SUBJECT_DATA } from "@/lib/demoData";
import RoughWorkCanvas from "@/components/RoughWorkCanvas";

function JeePracticeContent() {
  const searchParams = useSearchParams();
  const paramSubject = searchParams.get("subject");
  const paramChapter = searchParams.get("chapter");

  const [selectedSubject, setSelectedSubject] = useState<
    "Physics" | "Chemistry" | "Mathematics"
  >("Physics");
  const [selectedChapter, setSelectedChapter] = useState<string>("All");
  const [selectedExam, setSelectedExam] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  useEffect(() => {
    if (paramSubject && (paramSubject === "Physics" || paramSubject === "Chemistry" || paramSubject === "Mathematics")) {
      setSelectedSubject(paramSubject as any);
    }
    if (paramChapter) {
      setSelectedChapter(paramChapter);
    }
  }, [paramSubject, paramChapter]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showRoughWork, setShowRoughWork] = useState(false);

  // Performance tracking state
  const [userAnswers, setUserAnswers] = useState<
    Record<string, { option: string; isCorrect: boolean }>
  >({});

  // Restore user score history from localStorage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem("jee_pyq_user_answers");
      if (savedStats) {
        setUserAnswers(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error("Failed to load user PYQ stats:", e);
    }
  }, []);

  // Chapter options for selected subject
  const chaptersList = useMemo(() => {
    if (selectedSubject === "Physics") return SUBJECT_DATA.Physics;
    if (selectedSubject === "Mathematics") return SUBJECT_DATA.Mathematics;
    return [
      ...SUBJECT_DATA.Chemistry["Physical Chemistry"],
      ...SUBJECT_DATA.Chemistry["Inorganic Chemistry"],
      ...SUBJECT_DATA.Chemistry["Organic Chemistry"],
    ];
  }, [selectedSubject]);

  // Chapter PYQ total counts & shift breakdown
  const chapterStats = useMemo(() => {
    return getChapterPyqStats(selectedSubject, selectedChapter);
  }, [selectedSubject, selectedChapter]);

  // Filter questions dynamically
  const filteredQuestions = useMemo(() => {
    return JEE_PYQS.filter((q) => {
      if (q.subject !== selectedSubject) return false;

      if (selectedChapter !== "All") {
        const chLower = selectedChapter.toLowerCase();
        const qChLower = q.chapter.toLowerCase();
        if (!qChLower.includes(chLower) && !chLower.includes(qChLower)) {
          return false;
        }
      }

      if (selectedExam !== "All" && q.exam !== selectedExam) return false;
      if (selectedYear !== "All" && String(q.year) !== selectedYear) return false;
      if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) return false;

      return true;
    });
  }, [selectedSubject, selectedChapter, selectedExam, selectedYear, selectedDifficulty]);

  // Handle Current Question
  const currentQuestion: JeeQuestion | undefined = filteredQuestions[currentIndex];

  // Reset question state when index or filters change
  useEffect(() => {
    setSelectedOption(null);
    setSubmitted(false);
    setShowSolution(false);
  }, [currentIndex, selectedSubject, selectedChapter, selectedExam, selectedYear, selectedDifficulty]);

  const handleSelectOption = (opt: "A" | "B" | "C" | "D") => {
    if (submitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctOption;
    setSubmitted(true);

    const updated = {
      ...userAnswers,
      [currentQuestion.id]: { option: selectedOption, isCorrect },
    };
    setUserAnswers(updated);
    try {
      localStorage.setItem("jee_pyq_user_answers", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving answers:", e);
    }
  };

  // Performance stats calculation
  const stats = useMemo(() => {
    const totalAttempted = Object.keys(userAnswers).length;
    const correctCount = Object.values(userAnswers).filter((a) => a.isCorrect).length;
    const incorrectCount = totalAttempted - correctCount;
    const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
    return { totalAttempted, correctCount, incorrectCount, accuracy };
  }, [userAnswers]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      {/* Header */}
      <section className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500 flex items-center gap-1.5">
          <Target size={14} /> Official JEE Main & Advanced Preparation
        </p>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 md:text-4xl">
          Chapter-Wise JEE PYQs & Scratchpad
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Solve actual past year questions with interactive answer checking, step-by-step solutions, and built-in digital rough notebook.
        </p>
      </section>

      {/* Accuracy & Attempt Tracker Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl2 border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
              {stats.totalAttempted}
            </p>
            <p className="text-xs text-slate-400">Total Attempted</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl2 border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.correctCount}
            </p>
            <p className="text-xs text-slate-400">Correct Answers</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl2 border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
            <XCircle size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-rose-600 dark:text-rose-400">
              {stats.incorrectCount}
            </p>
            <p className="text-xs text-slate-400">Incorrect Answers</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl2 border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
              {stats.accuracy}%
            </p>
            <p className="text-xs text-slate-400">Overall Accuracy</p>
          </div>
        </div>
      </div>

      {/* Subject Switcher Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200/60 pb-3 dark:border-white/10">
        {[
          { label: "🔵 Physics", value: "Physics" },
          { label: "🟢 Chemistry", value: "Chemistry" },
          { label: "🔴 Mathematics", value: "Mathematics" },
        ].map((tab) => {
          const active = selectedSubject === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedSubject(tab.value as any);
                setSelectedChapter("All");
                setCurrentIndex(0);
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-maroon-500 text-white shadow-glow-maroon"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl2 border border-slate-200 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03] sm:grid-cols-4">
        {/* Chapter Filter */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Chapter
          </label>
          <select
            value={selectedChapter}
            onChange={(e) => {
              setSelectedChapter(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          >
            <option value="All">All Chapters ({chaptersList.length})</option>
            {chaptersList.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        {/* Exam Filter */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Exam
          </label>
          <select
            value={selectedExam}
            onChange={(e) => {
              setSelectedExam(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          >
            <option value="All">All Exams (Main & Advanced)</option>
            <option value="JEE Main">JEE Main</option>
            <option value="JEE Advanced">JEE Advanced</option>
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          >
            <option value="All">All Years (2015–2026)</option>
            {Array.from({ length: 12 }, (_, i) => 2026 - i).map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Difficulty
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Chapter Breakdown Summary Banner */}
      <div className="mb-8 rounded-xl2 border border-slate-200 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedChapter === "All" ? `${selectedSubject} (All Chapters)` : selectedChapter}
              </h2>
              <span className="rounded-full bg-maroon-500/10 px-3 py-0.5 text-xs font-bold text-maroon-600 dark:bg-maroon-500/20 dark:text-maroon-400">
                Total PYQs: {chapterStats.total}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Complete shift-wise JEE Main & Advanced questions collection (2015–2026).
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedExam("All");
              setSelectedYear("All");
              setSelectedDifficulty("All");
              setCurrentIndex(0);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-maroon-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Sparkles size={14} /> Practice ALL {chapterStats.total} PYQs
          </button>
        </div>

        {/* Year-by-Year Shift Breakdown Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Year-wise Coverage:
          </span>
          {Object.keys(chapterStats.yearBreakdown).length === 0 ? (
            <span className="text-xs text-slate-400">No shift data for this filter</span>
          ) : (
            Object.entries(chapterStats.yearBreakdown)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([yr, data]) => (
                <div
                  key={yr}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-white/10 dark:bg-white/5"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200">{yr}:</span>
                  <span className="font-semibold text-maroon-500">{data.count} PYQs</span>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Main Question View */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-slate-300 py-16 text-center dark:border-white/10">
          <HelpCircle size={32} className="mx-auto mb-3 text-slate-400" />
          <h3 className="font-display text-base font-semibold text-slate-700 dark:text-slate-200">
            No PYQs matched your filter criteria.
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Try resetting chapter or difficulty filters above.
          </p>
        </div>
      ) : currentQuestion ? (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            {/* Header Badges */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-maroon-50 px-2.5 py-1 text-xs font-bold text-maroon-600 dark:bg-maroon-500/10 dark:text-maroon-400">
                  {currentQuestion.exam} {currentQuestion.year}
                </span>
                {(currentQuestion.shift || currentQuestion.session) && (
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {currentQuestion.examDate || ""} {currentQuestion.session || ""} {currentQuestion.shift || ""}
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    currentQuestion.difficulty === "Easy"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : currentQuestion.difficulty === "Medium"
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {currentQuestion.chapter}
                </span>
                {currentQuestion.subtopic && (
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
                    {currentQuestion.subtopic}
                  </span>
                )}
              </div>

              <span className="text-xs font-mono font-medium text-slate-400">
                Question {currentIndex + 1} of {filteredQuestions.length}
              </span>
            </div>

            {/* Question Text */}
            <p className="mb-6 font-display text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100 md:text-lg">
              {currentQuestion.question}
            </p>

            {/* Radio Options Grid */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrectOpt = opt.id === currentQuestion.correctOption;

                let optionStyles =
                  "border-slate-200 bg-slate-50/50 hover:border-indigo-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/40";

                if (submitted) {
                  if (isCorrectOpt) {
                    optionStyles =
                      "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200 font-semibold";
                  } else if (isSelected && !isCorrectOpt) {
                    optionStyles =
                      "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200";
                  }
                } else if (isSelected) {
                  optionStyles =
                    "border-maroon-500 bg-maroon-50/60 dark:bg-maroon-500/15 text-maroon-900 dark:text-maroon-100 font-medium";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${optionStyles}`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                        isSelected
                          ? "bg-maroon-500 text-white"
                          : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      {opt.id}
                    </div>
                    <span className="flex-1 text-sm text-slate-800 dark:text-slate-200">
                      {opt.text}
                    </span>
                    {submitted && isCorrectOpt && (
                      <Check size={18} className="text-emerald-600 dark:text-emerald-400" />
                    )}
                    {submitted && isSelected && !isCorrectOpt && (
                      <X size={18} className="text-rose-600 dark:text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Interactive Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-white/5">
              <div className="flex flex-wrap items-center gap-2">
                {!submitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                    className="flex items-center gap-1.5 rounded-xl bg-maroon-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-maroon-600 disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {selectedOption === currentQuestion.correctOption ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={16} /> Correct! +4 Marks
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <XCircle size={16} /> Incorrect (-1 Mark). Correct answer is Option{" "}
                        {currentQuestion.correctOption}.
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setShowSolution((s) => !s)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                >
                  <Sparkles size={14} className="text-maroon-500" />
                  {showSolution ? "Hide Solution" : "Show Solution"}
                </button>
              </div>

              {/* 📝 Rough Work Canvas Toggle */}
              <button
                onClick={() => setShowRoughWork((r) => !r)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                  showRoughWork
                    ? "border-maroon-500 bg-maroon-500 text-white shadow-glow-maroon"
                    : "border-slate-300 bg-slate-900 text-white hover:bg-slate-800 dark:border-white/10"
                }`}
              >
                <PenTool size={14} />
                <span>📝 {showRoughWork ? "Close Scratchpad" : "Rough Work"}</span>
              </button>
            </div>

            {/* Hidden Solution Panel */}
            <AnimatePresence>
              {showSolution && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/10"
                >
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    <Sparkles size={14} /> Step-by-Step Solution & Concept Derivation
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                    {currentQuestion.solution}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rough Work Canvas Panel */}
          {showRoughWork && (
            <div className="mt-4">
              <RoughWorkCanvas
                questionId={currentQuestion.id}
                isOpen={showRoughWork}
                onClose={() => setShowRoughWork(false)}
              />
            </div>
          )}

          {/* Navigation Bar: Previous / Next */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/5">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <ChevronLeft size={16} /> Previous Question
            </button>

            <button
              onClick={() =>
                setCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))
              }
              disabled={currentIndex === filteredQuestions.length - 1}
              className="flex items-center gap-1.5 rounded-xl bg-maroon-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-maroon-600 disabled:opacity-40"
            >
              Next Question <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function JeePracticePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-slate-400">Loading PYQ Practice...</div>}>
      <JeePracticeContent />
    </Suspense>
  );
}
