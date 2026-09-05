"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  Flame,
  BarChart3,
  BookOpen,
  Zap,
  Target,
  Award,
} from "lucide-react";

interface AnswerRecord {
  option: string;
  isCorrect: boolean;
  subject?: string;
  chapter?: string;
  timestamp?: string;
}

export default function UserAnalyticsSection() {
  const [userAnswers, setUserAnswers] = useState<Record<string, AnswerRecord>>({});

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem("jee_pyq_user_answers");
      if (savedStats) {
        setUserAnswers(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error("Failed to load user analytics:", e);
    }
  }, []);

  const stats = useMemo(() => {
    const entries = Object.values(userAnswers);
    const totalOverall = entries.length;

    const todayStr = new Date().toISOString().split("T")[0];
    const monthStr = todayStr.substring(0, 7); // YYYY-MM

    let doneToday = 0;
    let doneThisMonth = 0;
    let correctCount = 0;

    const subjectCounts: Record<string, number> = {
      Physics: 0,
      Chemistry: 0,
      Mathematics: 0,
    };

    // Calculate last 7 days distribution
    const last7DaysMap: Record<string, number> = {};
    const dayLabels: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      last7DaysMap[dateKey] = 0;
      dayLabels.push(dateKey);
    }

    const getRecordDate = (ts: any): string => {
      if (!ts) return todayStr;
      if (typeof ts === "string") {
        return ts.includes("T") ? ts.split("T")[0] : ts.slice(0, 10);
      }
      if (typeof ts === "number") {
        try {
          return new Date(ts).toISOString().split("T")[0];
        } catch {
          return todayStr;
        }
      }
      return todayStr;
    };

    entries.forEach((record) => {
      if (record.isCorrect) correctCount++;

      // Timestamp fallback
      const recordDate = getRecordDate(record.timestamp);

      if (recordDate === todayStr) {
        doneToday++;
      }
      if (recordDate.startsWith(monthStr)) {
        doneThisMonth++;
      }

      if (last7DaysMap[recordDate] !== undefined) {
        last7DaysMap[recordDate]++;
      }

      if (record.subject && subjectCounts[record.subject] !== undefined) {
        subjectCounts[record.subject]++;
      }
    });

    const accuracy = totalOverall > 0 ? Math.round((correctCount / totalOverall) * 100) : 0;

    // Calculate streak
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const countOnDate = entries.filter(
        (r) => getRecordDate(r.timestamp) === dateKey
      ).length;
      if (countOnDate > 0) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Chart daily bars
    const dailyData = dayLabels.map((dateKey) => {
      const dateObj = new Date(dateKey);
      return {
        day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
        date: dateKey,
        count: last7DaysMap[dateKey] || 0,
      };
    });

    const maxDailyCount = Math.max(...dailyData.map((d) => d.count), 5);

    return {
      doneToday,
      doneThisMonth,
      totalOverall,
      accuracy,
      currentStreak,
      subjectCounts,
      dailyData,
      maxDailyCount,
    };
  }, [userAnswers]);

  return (
    <div className="mb-10 space-y-6">
      {/* 3 Main Counter Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Today */}
        <div className="relative overflow-hidden rounded-xl2 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-surface-dark">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-glow-emerald">
              <Zap size={20} />
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              Today's Goal
            </span>
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stats.doneToday} <span className="text-sm font-normal text-slate-500">questions</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Questions Done Today
            </p>
          </div>
        </div>

        {/* This Month */}
        <div className="relative overflow-hidden rounded-xl2 border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-surface-dark">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-glow-indigo">
              <Calendar size={20} />
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              Monthly Pace
            </span>
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stats.doneThisMonth} <span className="text-sm font-normal text-slate-500">questions</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Questions Done This Month
            </p>
          </div>
        </div>

        {/* Overall */}
        <div className="relative overflow-hidden rounded-xl2 border border-maroon-200 bg-gradient-to-br from-maroon-50 to-white p-5 shadow-sm dark:border-maroon-500/20 dark:from-maroon-500/10 dark:to-surface-dark">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon-500 text-white shadow-glow-maroon">
              <Award size={20} />
            </div>
            <span className="rounded-full bg-maroon-100 px-2.5 py-0.5 text-[11px] font-bold text-maroon-700 dark:bg-maroon-500/20 dark:text-maroon-300">
              All-Time Total
            </span>
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stats.totalOverall} <span className="text-sm font-normal text-slate-500">solved</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Overall Questions Solved
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Grid: Daily Activity Chart + Subject Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Activity Chart (2 cols) */}
        <div className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03] lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 size={18} className="text-maroon-500" /> Daily Practice Activity
              </h3>
              <p className="text-xs text-slate-400">Questions solved in the last 7 days</p>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <Flame size={14} className="text-amber-500 fill-amber-500" /> {stats.currentStreak} Day Streak
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-4 flex h-40 items-end justify-between gap-3 border-b border-slate-200 pb-2 dark:border-white/10">
            {stats.dailyData.map((d) => {
              const heightPercent = Math.max(12, Math.round((d.count / stats.maxDailyCount) * 100));
              const isToday = d.date === new Date().toISOString().split("T")[0];

              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {d.count > 0 ? d.count : ""}
                  </span>
                  <div className="w-full max-w-[36px] flex-1 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? "bg-gradient-to-t from-maroon-600 to-indigo-500 shadow-glow-maroon"
                          : d.count > 0
                          ? "bg-indigo-400 dark:bg-indigo-500/70"
                          : "bg-slate-100 dark:bg-white/5"
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? "font-bold text-maroon-600 dark:text-maroon-400" : "text-slate-400"}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Accuracy Rate: <strong className="text-emerald-600 dark:text-emerald-400">{stats.accuracy}%</strong></span>
            <span>Target: 20 Questions / day</span>
          </div>
        </div>

        {/* Subject Breakdown Distribution (1 col) */}
        <div className="rounded-xl2 border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
          <h3 className="mb-1 font-display text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target size={18} className="text-indigo-500" /> Subject Distribution
          </h3>
          <p className="mb-5 text-xs text-slate-400">Questions completed per subject</p>

          <div className="space-y-4">
            {/* Physics */}
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300">🔵 Physics</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {stats.subjectCounts.Physics || 0} PYQs
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div
                  style={{
                    width: `${
                      stats.totalOverall > 0
                        ? Math.round(((stats.subjectCounts.Physics || 0) / stats.totalOverall) * 100)
                        : 0
                    }%`,
                  }}
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Chemistry */}
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300">🟢 Chemistry</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {stats.subjectCounts.Chemistry || 0} PYQs
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div
                  style={{
                    width: `${
                      stats.totalOverall > 0
                        ? Math.round(((stats.subjectCounts.Chemistry || 0) / stats.totalOverall) * 100)
                        : 0
                    }%`,
                  }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Mathematics */}
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300">🔴 Mathematics</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {stats.subjectCounts.Mathematics || 0} PYQs
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div
                  style={{
                    width: `${
                      stats.totalOverall > 0
                        ? Math.round(((stats.subjectCounts.Mathematics || 0) / stats.totalOverall) * 100)
                        : 0
                    }%`,
                  }}
                  className="h-full bg-maroon-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-white/5 dark:text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-700 dark:text-slate-200">Study Tip:</strong> Consistent practice across all 3 subjects improves overall percentile in JEE Main & Advanced!
          </div>
        </div>
      </div>
    </div>
  );
}
