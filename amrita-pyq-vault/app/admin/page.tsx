"use client";

import { useState, useMemo, useEffect, FormEvent } from "react";
import { ShieldCheck, BookOpen, Plus, Trash2, CheckCircle2, AlertCircle, HelpCircle, Filter, Sparkles, Target } from "lucide-react";
import { SUBJECT_DATA } from "@/lib/demoData";
import { JEE_PYQS, JeeQuestion, addCustomQuestionToStorage, getStoredCustomQuestions } from "@/lib/jeeData";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [selectedSubject, setSelectedSubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");
  const [selectedChapter, setSelectedChapter] = useState<string>("Kinematics");

  // Form State for Adding New Question
  const [showAddForm, setShowAddForm] = useState(false);
  const [subtopic, setSubtopic] = useState("");
  const [exam, setExam] = useState<"JEE Main" | "JEE Advanced">("JEE Main");
  const [year, setYear] = useState<number>(2025);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const [questionText, setQuestionText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("A");
  const [solutionText, setSolutionText] = useState("");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Available chapters based on subject
  const availableChapters = useMemo(() => {
    if (selectedSubject === "Physics") return SUBJECT_DATA.Physics;
    if (selectedSubject === "Mathematics") return SUBJECT_DATA.Mathematics;
    return [
      ...SUBJECT_DATA.Chemistry["Physical Chemistry"],
      ...SUBJECT_DATA.Chemistry["Inorganic Chemistry"],
      ...SUBJECT_DATA.Chemistry["Organic Chemistry"],
    ];
  }, [selectedSubject]);

  // Set default chapter when subject changes
  useEffect(() => {
    if (availableChapters.length > 0) {
      setSelectedChapter(availableChapters[0]);
    }
  }, [selectedSubject, availableChapters]);

  // Restore stored custom questions on client side
  const [allQuestions, setAllQuestions] = useState<JeeQuestion[]>(JEE_PYQS);

  useEffect(() => {
    const customQs = getStoredCustomQuestions();
    const combined = [...customQs];
    for (const q of JEE_PYQS) {
      if (!combined.some((item) => item.id === q.id)) {
        combined.push(q);
      }
    }
    setAllQuestions(combined);
  }, []);

  // Filter questions for the selected chapter
  const chapterQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (q.subject !== selectedSubject) return false;
      const chLower = selectedChapter.toLowerCase();
      const qChLower = q.chapter.toLowerCase();
      return qChLower.includes(chLower) || chLower.includes(qChLower);
    });
  }, [allQuestions, selectedSubject, selectedChapter]);

  const handleAddQuestion = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!questionText.trim()) {
      setErrorMsg("Please enter the question statement.");
      return;
    }
    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      setErrorMsg("Please fill out all options.");
      return;
    }
    if (!solutionText.trim()) {
      setErrorMsg("Please provide a solution.");
      return;
    }

    const newQuestion: JeeQuestion = {
      id: `admin-q-${Date.now()}`,
      subject: selectedSubject,
      chapter: selectedChapter,
      subtopic: subtopic.trim() || `${selectedChapter} Practice`,
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

    setAllQuestions((prev) => [newQuestion, ...prev]);
    setSuccessMsg(`New question added to ${selectedChapter}!`);
    setShowAddForm(false);

    // Reset form
    setQuestionText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setSolutionText("");
    setSubtopic("");
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    setAllQuestions((prev) => prev.filter((q) => q.id !== id));
    setSuccessMsg("Question removed.");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500">
            <ShieldCheck size={14} /> Admin Chapter & Question Management
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 md:text-4xl">
            Admin Control Center
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select any chapter to view, manage, and add new practice questions directly into the syllabus.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-maroon-500 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-maroon-600"
        >
          <Plus size={16} /> {showAddForm ? "Close Form" : "Add Question to Chapter"}
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Chapter Selection Bar */}
      <div className="glass-card mb-8 rounded-xl2 p-6 shadow-glass dark:glass-dark space-y-4">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen size={18} className="text-maroon-500" /> Select Subject & Target Chapter
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Subject
            </label>
            <div className="flex gap-2">
              {(["Physics", "Chemistry", "Mathematics"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                    selectedSubject === s
                      ? "bg-maroon-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            >
              {availableChapters.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Question Form Modal/Panel */}
      {showAddForm && (
        <form onSubmit={handleAddQuestion} className="mb-10 space-y-6 glass-card rounded-xl2 p-6 border border-maroon-500/30 dark:glass-dark shadow-lg">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Plus size={18} className="text-maroon-500" /> Add Question to: <span className="text-maroon-500">{selectedSubject} — {selectedChapter}</span>
          </h2>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-maroon-600 dark:bg-red-500/10 dark:text-maroon-400">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Subtopic / Tag
              </label>
              <input
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g. Formula derivation"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Exam Type
              </label>
              <select
                value={exam}
                onChange={(e) => setExam(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
              >
                <option value="JEE Main">JEE Main</option>
                <option value="JEE Advanced">JEE Advanced</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
              >
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Question Statement *
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter question text..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={optA}
              onChange={(e) => setOptA(e.target.value)}
              placeholder="Option (A) *"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            />
            <input
              value={optB}
              onChange={(e) => setOptB(e.target.value)}
              placeholder="Option (B) *"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            />
            <input
              value={optC}
              onChange={(e) => setOptC(e.target.value)}
              placeholder="Option (C) *"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            />
            <input
              value={optD}
              onChange={(e) => setOptD(e.target.value)}
              placeholder="Option (D) *"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Correct Answer Option
            </label>
            <div className="flex gap-4">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="adminCorrectOpt"
                    checked={correctOption === opt}
                    onChange={() => setCorrectOption(opt)}
                  />
                  Option ({opt})
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Step-by-Step Solution *
            </label>
            <textarea
              rows={3}
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              placeholder="Enter step-by-step derivation & explanation..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:outline-none dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-maroon-500 px-5 py-2.5 text-xs font-medium text-white shadow hover:bg-maroon-600"
          >
            Save & Publish Question
          </button>
        </form>
      )}

      {/* Question List Header & Summary */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
          Questions in <span className="text-maroon-500">{selectedChapter}</span> ({chapterQuestions.length})
        </h2>
        <Link
          href={`/jee-practice?subject=${encodeURIComponent(selectedSubject)}&chapter=${encodeURIComponent(selectedChapter)}`}
          className="text-xs font-semibold text-maroon-500 hover:underline flex items-center gap-1"
        >
          <Target size={14} /> Open in Practice View →
        </Link>
      </div>

      {/* Questions List */}
      {chapterQuestions.length === 0 ? (
        <div className="glass-card rounded-xl2 p-10 text-center dark:glass-dark text-slate-500">
          No questions added for this chapter yet. Click <strong>Add Question to Chapter</strong> above to create one!
        </div>
      ) : (
        <div className="space-y-4">
          {chapterQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="glass-card rounded-xl2 p-5 shadow-glass dark:glass-dark border border-slate-200/60 dark:border-white/5"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-maroon-500/10 px-2.5 py-1 font-mono text-xs font-bold text-maroon-500">
                    Q{idx + 1}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {q.exam} {q.year}
                  </span>
                  <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-500">
                    {q.difficulty}
                  </span>
                  {q.subtopic && (
                    <span className="text-xs text-slate-400">
                      • {q.subtopic}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>

              <p className="mb-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                {q.question}
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs mb-3">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`rounded-lg px-3 py-2 border ${
                      q.correctOption === opt.id
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    ({opt.id}) {opt.text}
                    {q.correctOption === opt.id && " ✓"}
                  </div>
                ))}
              </div>

              {q.solution && (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Solution: </span>
                  {q.solution}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
