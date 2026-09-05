"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Trash2, Eye, FileText, Users, Clock, Loader2, Sparkles } from "lucide-react";
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

interface AdminStats {
  totalPapers: number;
  approvedCount: number;
  pendingCount: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
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
      setQueue(data.queue || []);
    } catch (err) {
      console.error(err);
      setError("Network error loading admin queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (paperId: string, status: "APPROVED" | "REJECTED") => {
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
          Log in with an admin account (e.g. admin@amrita.edu / admin123) to access paper moderation.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500">
          <ShieldCheck size={14} /> System Administration
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Moderation & System Analytics
        </h1>
      </div>

      {/* Analytics Overview Cards */}
      {stats && (
        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Total Papers"
            value={stats.totalPapers}
            color="text-indigo-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Approved & Live"
            value={stats.approvedCount}
            color="text-emerald-500"
          />
          <StatCard
            icon={Clock}
            label="Pending Moderation"
            value={stats.pendingCount}
            color="text-amber-500"
          />
          <StatCard
            icon={Users}
            label="Registered Users"
            value={stats.totalUsers}
            color="text-maroon-500"
          />
        </div>
      )}

      {/* Queue Table */}
      <section className="rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03]">
        <h2 className="mb-6 font-display text-lg font-medium text-slate-800 dark:text-slate-100">
          Paper Moderation Queue ({queue.length})
        </h2>

        {loading ? (
          <div className="flex py-12 justify-center items-center text-slate-400">
            <Loader2 size={20} className="animate-spin text-maroon-500 mr-2" />
            Loading queue…
          </div>
        ) : queue.length === 0 ? (
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
                {queue.map((entry) => {
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
                                onClick={() => handleUpdateStatus(paper.id, "APPROVED")}
                                disabled={actionLoading === paper.id}
                                className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(paper.id, "REJECTED")}
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
