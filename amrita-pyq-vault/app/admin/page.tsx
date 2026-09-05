"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  FileText,
  Users,
  Clock,
  Loader2,
  Sparkles,
  HelpCircle,
  Check,
  X,
} from "lucide-react";
import PdfModal from "@/components/PdfModal";

interface QueueEntry {
  id: string;
  paperId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  paper: {
    id: string;
    examType: string;
    year: number;
    regulation: string;
    fileUrl: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    subject: {
      code: string;
      name: string;
      branch: {
        code: string;
      };
    };
    uploadedBy: {
      name: string;
      email: string;
    };
  };
}

interface QuestionSubmissionEntry {
  id: string;
  subject: string;
  chapter: string;
  subtopic?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  solution: string;
  exam?: string;
  year?: number;
  difficulty?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  submittedBy: {
    name: string;
    email: string;
  };
}

interface AdminStats {
  totalPapers: number;
  approvedCount: number;
  pendingCount: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"questions" | "papers">("questions");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [paperQueue, setPaperQueue] = useState<QueueEntry[]>([]);
  const [questionSubmissions, setQuestionSubmissions] = useState<QuestionSubmissionEntry[]>([]);
  const [questionFilterStatus, setQuestionFilterStatus] = useState<string>("PENDING");

  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [aiExtractLoading, setAiExtractLoading] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/papers");
      if (!res.ok) {
        if (res.status === 403) {
          setError("Access denied. Admin privileges required.");
        } else {
          setError("Failed to load admin data.");
        }
        return;
      }
      const data = await res.json();
      setStats(data.stats);
      setPaperQueue(data.queue || []);
    } catch (err) {
      console.error(err);
      setError("Network error loading admin queue.");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionSubmissions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/submitted-questions?status=${questionFilterStatus}`
      );
      if (res.ok) {
        const data = await res.json();
        setQuestionSubmissions(data);
      }
    } catch (err) {
      console.error("Error loading question submissions:", err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    loadQuestionSubmissions();
  }, [questionFilterStatus]);

  const handleUpdateQuestionStatus = async (
    id: string,
    action: "APPROVE" | "REJECT"
  ) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/submitted-questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        await loadQuestionSubmissions();
      }
    } catch (err) {
      console.error("Error updating question status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePaperStatus = async (
    paperId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setActionLoading(paperId);
    try {
      const res = await fetch(`/api/admin/papers/${paperId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeletePaper = async (paperId: string) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;
    setActionLoading(paperId);
    try {
      const res = await fetch(`/api/admin/papers/${paperId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error("Error deleting paper:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTriggerAiExtract = async (paperId: string) => {
    setAiExtractLoading(paperId);
    try {
      const res = await fetch("/api/ai/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Successfully extracted ${data.questionsCount || 0} questions with AI!`);
        await loadAdminData();
      } else {
        alert(data.error || "AI Extraction failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error triggering AI extraction.");
    } finally {
      setAiExtractLoading(null);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <ShieldCheck size={40} className="mx-auto mb-3 text-red-500" />
        <h1 className="font-display text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Admin Access Required
        </h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <p className="mt-1 text-xs text-slate-400">
          Log in with an admin account to access moderation controls.
        </p>
      </div>
    );
  }

  const pendingQuestionsCount = questionSubmissions.filter((q) => q.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500">
          <ShieldCheck size={14} /> System Administration
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Admin Control & Moderation
        </h1>
      </div>

      {/* Analytics Overview Cards */}
      {stats && (
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={HelpCircle}
            label="Pending Questions"
            value={pendingQuestionsCount}
            color="text-amber-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Live Papers"
            value={stats.approvedCount}
            color="text-emerald-500"
          />
          <StatCard
            icon={FileText}
            label="Total Papers"
            value={stats.totalPapers}
            color="text-indigo-500"
          />
          <StatCard
            icon={Users}
            label="Registered Users"
            value={stats.totalUsers}
            color="text-maroon-500"
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 flex gap-3 border-b border-slate-200 pb-3 dark:border-white/10">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "questions"
              ? "bg-maroon-500 text-white shadow-glow-maroon"
              : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300"
          }`}
        >
          <HelpCircle size={16} /> Submitted Questions Queue
          {pendingQuestionsCount > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
              {pendingQuestionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("papers")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "papers"
              ? "bg-maroon-500 text-white shadow-glow-maroon"
              : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300"
          }`}
        >
          <FileText size={16} /> Paper Moderation Queue ({paperQueue.length})
        </button>
      </div>

      {/* Tab 1: Submitted Questions Approval Queue */}
      {activeTab === "questions" && (
        <section className="rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">
                User-Submitted Questions Approval
              </h2>
              <p className="text-xs text-slate-400">
                Review questions uploaded by students before publishing them to the PYQ bank.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
              {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
                <button
                  key={st}
                  onClick={() => setQuestionFilterStatus(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    questionFilterStatus === st
                      ? "bg-maroon-500 text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {questionsLoading ? (
            <div className="flex py-12 justify-center items-center text-slate-400">
              <Loader2 size={20} className="animate-spin text-maroon-500 mr-2" />
              Loading submitted questions…
            </div>
          ) : questionSubmissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No submitted questions in status "{questionFilterStatus}".
            </div>
          ) : (
            <div className="space-y-6">
              {questionSubmissions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-maroon-50 px-2.5 py-0.5 text-xs font-bold text-maroon-600 dark:bg-maroon-500/10 dark:text-maroon-400">
                        {q.subject}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                        {q.chapter}
                      </span>
                      {q.difficulty && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                          {q.difficulty}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          q.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : q.status === "PENDING"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Submitted by <span className="font-semibold text-slate-700 dark:text-slate-300">{q.submittedBy?.name || "Student"}</span> ({q.submittedBy?.email})
                    </div>
                  </div>

                  {/* Question text */}
                  <p className="mb-4 font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {q.questionText}
                  </p>

                  {/* Options */}
                  <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                    <div className={`p-2.5 rounded-lg border ${q.correctOption === "A" ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-500/10 dark:text-emerald-200" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
                      A: {q.optionA}
                    </div>
                    <div className={`p-2.5 rounded-lg border ${q.correctOption === "B" ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-500/10 dark:text-emerald-200" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
                      B: {q.optionB}
                    </div>
                    <div className={`p-2.5 rounded-lg border ${q.correctOption === "C" ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-500/10 dark:text-emerald-200" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
                      C: {q.optionC}
                    </div>
                    <div className={`p-2.5 rounded-lg border ${q.correctOption === "D" ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-500/10 dark:text-emerald-200" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
                      D: {q.optionD}
                    </div>
                  </div>

                  {/* Solution */}
                  <div className="mb-4 rounded-lg bg-indigo-50/70 p-3 text-xs text-slate-800 dark:bg-indigo-500/10 dark:text-slate-200">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">Solution: </span>
                    {q.solution}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 pt-3 dark:border-white/10">
                    {q.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleUpdateQuestionStatus(q.id, "APPROVE")}
                          disabled={actionLoading === q.id}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                        >
                          <Check size={14} /> Approve & Publish
                        </button>
                        <button
                          onClick={() => handleUpdateQuestionStatus(q.id, "REJECT")}
                          disabled={actionLoading === q.id}
                          className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}
                    {q.status === "APPROVED" && (
                      <button
                        onClick={() => handleUpdateQuestionStatus(q.id, "REJECT")}
                        disabled={actionLoading === q.id}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                      >
                        Unpublish / Reject
                      </button>
                    )}
                    {q.status === "REJECTED" && (
                      <button
                        onClick={() => handleUpdateQuestionStatus(q.id, "APPROVE")}
                        disabled={actionLoading === q.id}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                      >
                        Re-approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Paper Queue Table */}
      {activeTab === "papers" && (
        <section className="rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
          <h2 className="mb-6 font-display text-lg font-medium text-slate-800 dark:text-slate-100">
            Paper Moderation Queue ({paperQueue.length})
          </h2>

          {loading ? (
            <div className="flex py-12 justify-center items-center text-slate-400">
              <Loader2 size={20} className="animate-spin text-maroon-500 mr-2" />
              Loading paper queue…
            </div>
          ) : paperQueue.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No papers in the moderation queue.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 dark:border-white/5">
                    <th className="pb-3 font-medium">Subject / Paper</th>
                    <th className="pb-3 font-medium">Exam & Year</th>
                    <th className="pb-3 font-medium">Uploaded By</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {paperQueue.map((entry) => {
                    const paper = entry.paper;
                    const isPending = paper.status === "PENDING";
                    const isApproved = paper.status === "APPROVED";

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-3.5">
                          <p className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                            {paper.subject.code}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400">{paper.subject.name}</p>
                        </td>

                        <td className="py-3.5 text-slate-600 dark:text-slate-300">
                          {paper.examType.replace("_", " ")} ({paper.year})
                        </td>

                        <td className="py-3.5 text-slate-500 dark:text-slate-400">
                          {paper.uploadedBy.name} ({paper.uploadedBy.email})
                        </td>

                        <td className="py-3.5">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : isPending
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            }`}
                          >
                            {paper.status}
                          </span>
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                setPreviewFile({
                                  url: paper.fileUrl,
                                  title: `${paper.subject.code} (${paper.year})`,
                                })
                              }
                              title="Preview PDF"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => handleTriggerAiExtract(paper.id)}
                              disabled={aiExtractLoading === paper.id}
                              title="Trigger AI Question Extraction"
                              className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300"
                            >
                              {aiExtractLoading === paper.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Sparkles size={12} />
                              )}
                              Extract AI
                            </button>

                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleUpdatePaperStatus(paper.id, "APPROVED")}
                                  disabled={actionLoading === paper.id}
                                  className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-600"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdatePaperStatus(paper.id, "REJECTED")}
                                  disabled={actionLoading === paper.id}
                                  className="flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-amber-600"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeletePaper(paper.id)}
                              disabled={actionLoading === paper.id}
                              title="Delete paper from database"
                              className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {previewFile && (
        <PdfModal
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileUrl={previewFile.url}
          title={previewFile.title}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl2 border border-slate-200 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {value}
        </p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}
