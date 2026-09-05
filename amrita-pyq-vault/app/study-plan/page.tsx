"use client";

import { useEffect, useState, FormEvent } from "react";
import { BookOpen, Calendar, Clock, Sparkles, CheckCircle2, Circle, Loader2, ArrowRight } from "lucide-react";

interface SubjectOption {
  id: string;
  code: string;
  name: string;
  branch: string;
}

interface StudyDay {
  day: number;
  title: string;
  focusTopics: string[];
  tasks: string[];
  targetHours: number;
}

interface PlanResult {
  subjectCode: string;
  subjectName: string;
  daysRemaining: number;
  hoursPerDay: number;
  prepLevel: string;
  plan: StudyDay[];
}

export default function StudyPlanPage() {
  const DEFAULT_JEE_SUBJECTS: SubjectOption[] = [
    { id: "jee-phy", code: "JEE_PHYSICS", name: "🔵 JEE Physics (24 Chapters)", branch: "JEE" },
    { id: "jee-chem", code: "JEE_CHEMISTRY", name: "🟢 JEE Chemistry (32 Chapters)", branch: "JEE" },
    { id: "jee-math", code: "JEE_MATHEMATICS", name: "🔴 JEE Mathematics (18 Chapters)", branch: "JEE" },
  ];

  const [subjects, setSubjects] = useState<SubjectOption[]>(DEFAULT_JEE_SUBJECTS);
  const [subjectCode, setSubjectCode] = useState("JEE_PHYSICS");
  const [daysRemaining, setDaysRemaining] = useState(5);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [prepLevel, setPrepLevel] = useState("INTERMEDIATE");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectCode,
          daysRemaining,
          hoursPerDay,
          prepLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Failed to generate study plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const totalTasks = result ? result.plan.reduce((sum, d) => sum + d.tasks.length, 0) : 0;
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500">
          <BookOpen size={14} /> AI Exam Prep Engine
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-50">
          PYQ AI Study Planner
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Generate a custom revision timetable based on actual previous question paper weightage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
          >
            <h2 className="mb-4 font-display text-base font-semibold text-slate-800 dark:text-slate-100">
              Plan Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Target Subject
                </label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                >
                  {subjects.length > 0 ? (
                    subjects.map((s) => (
                      <option key={s.id || s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))
                  ) : (
                    <option value="21CSE201">21CSE201 - Data Structures & Algorithms</option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Days Remaining Until Exam
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={daysRemaining}
                  onChange={(e) => setDaysRemaining(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Available Study Hours Per Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  step={0.5}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Current Preparation Level
                </label>
                <select
                  value={prepLevel}
                  onChange={(e) => setPrepLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                >
                  <option value="BEGINNER">Beginner (Starting from scratch)</option>
                  <option value="INTERMEDIATE">Intermediate (Covered syllabus once)</option>
                  <option value="ADVANCED">Advanced (Final revision mode)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-maroon-500 py-3 text-sm font-medium text-white hover:bg-maroon-600 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                Generate Study Plan
              </button>
            </div>
          </form>
        </div>

        {/* Plan Output Display */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6">
              {/* Overview Header */}
              <div className="rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-maroon-500">
                    {result.subjectCode}
                  </span>
                  <span className="text-xs text-slate-400">
                    {result.daysRemaining} Days · {result.hoursPerDay} Hrs/Day · {result.prepLevel}
                  </span>
                </div>
                <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                  Revision Plan for {result.subjectName}
                </h2>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Overall Progress
                    </span>
                    <span className="font-mono font-bold text-maroon-500">
                      {progressPercent}% ({completedCount}/{totalTasks} tasks)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-maroon-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Day-by-Day List */}
              <div className="space-y-4">
                {result.plan.map((dayPlan) => (
                  <div
                    key={dayPlan.day}
                    className="rounded-xl2 border border-slate-200 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-maroon-500 text-xs font-bold text-white">
                          D{dayPlan.day}
                        </span>
                        <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {dayPlan.title}
                        </h3>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={13} /> {dayPlan.targetHours} Hours
                      </span>
                    </div>

                    {/* Focus Topics Badges */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {dayPlan.focusTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                        >
                          Focus: {topic}
                        </span>
                      ))}
                    </div>

                    {/* Tasks Checklist */}
                    <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-white/5">
                      {dayPlan.tasks.map((task, tIdx) => {
                        const key = `d${dayPlan.day}-t${tIdx}`;
                        const isDone = completedTasks[key] || false;
                        return (
                          <div
                            key={key}
                            onClick={() => toggleTask(key)}
                            className="flex cursor-pointer items-start gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            {isDone ? (
                              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle size={16} className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600" />
                            )}
                            <span
                              className={`text-xs ${
                                isDone
                                  ? "line-through text-slate-400"
                                  : "text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl2 border border-dashed border-slate-300 py-20 text-center dark:border-white/10">
              <Sparkles size={32} className="mx-auto mb-3 text-indigo-400" />
              <p className="font-display text-base text-slate-700 dark:text-slate-200">
                Ready to generate your exam study schedule
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Select a subject and click "Generate Study Plan" to build your data-driven timetable.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
