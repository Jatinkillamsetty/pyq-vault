"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Bookmark as BookmarkIcon, FileText, Calendar, Layers, Eye, Sparkles, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PdfModal from "@/components/PdfModal";

interface Question {
  id: string;
  questionNo: string;
  text: string;
  marks?: number;
  unit?: number;
  topic?: string;
}

interface PaperDetail {
  id: string;
  examType: string;
  year: number;
  regulation: string;
  fileUrl: string;
  status: string;
  extractedTopics?: { topic: string; frequency: number }[];
  subject: {
    code: string;
    name: string;
    semester: number;
    branch: {
      code: string;
      name: string;
    };
  };
  uploadedBy: {
    name: string;
    email: string;
  };
  questions: Question[];
}

export default function PaperDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const paperId = params.id;
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadPaper() {
      try {
        const res = await fetch(`/api/papers/${paperId}`);
        if (res.ok) {
          const data = await res.json();
          setPaper(data);

          // Track in recently viewed
          try {
            const paperCardFormat = {
              id: data.id,
              subjectCode: data.subject.code,
              subjectName: data.subject.name,
              branch: data.subject.branch.code,
              semester: data.subject.semester,
              regulation: data.regulation,
              examType: data.examType,
              year: data.year,
              fileUrl: data.fileUrl,
            };
            const stored = localStorage.getItem("recently_viewed_papers");
            let list = stored ? JSON.parse(stored) : [];
            list = list.filter((p: any) => p.id !== data.id);
            list.unshift(paperCardFormat);
            localStorage.setItem("recently_viewed_papers", JSON.stringify(list.slice(0, 10)));
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error("Failed to load paper details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPaper();
  }, [paperId]);

  const toggleBookmark = async () => {
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePaper = async () => {
    if (!paper) return;
    if (!confirm(`Admin Action: Delete paper ${paper.subject.code} (${paper.year}) permanently?`)) {
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/papers/${paper.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Paper deleted successfully.");
        router.push("/browse");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete paper.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error deleting paper.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin text-maroon-500 mr-2" />
        Loading paper details…
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200">Paper not found</h2>
        <p className="mt-2 text-sm text-slate-400">The paper you are looking for does not exist or has been removed.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-maroon-500 px-4 py-2 text-sm font-medium text-white">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <Link href="/browse" className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to browse
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 rounded-xl2 border border-slate-200 bg-white p-6 dark:border-white/5 dark:bg-white/[0.03] md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-maroon-500">{paper.subject.code}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-300">
              {paper.subject.branch.code}
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              Sem {paper.subject.semester}
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
              Reg {paper.regulation}
            </span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
            {paper.subject.name}
          </h1>

          <p className="mt-2 text-xs text-slate-400">
            {paper.examType.replace("_", " ")} Exam ({paper.year}) · Uploaded by {paper.uploadedBy.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
              bookmarked
                ? "border-maroon-500 bg-maroon-50 text-maroon-500 dark:bg-maroon-500/20 dark:text-maroon-400"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            }`}
          >
            <BookmarkIcon size={14} className={bookmarked ? "fill-current" : ""} />
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </button>

          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          >
            <Eye size={14} /> Fullscreen PDF
          </button>

          <a
            href={paper.fileUrl}
            download
            className="flex items-center gap-1.5 rounded-xl bg-maroon-500 px-4 py-2 text-xs font-medium text-white hover:bg-maroon-600"
          >
            <Download size={14} /> Download PDF
          </a>

          {isAdmin && (
            <button
              onClick={handleDeletePaper}
              disabled={deleteLoading}
              title="Admin: Delete Paper"
              className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
            >
              {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete Paper
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* PDF Embedded View */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl2 border border-slate-200 bg-white dark:border-white/5 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">PDF Document View</span>
              <button
                onClick={() => setPreviewOpen(true)}
                className="text-xs text-maroon-500 hover:underline"
              >
                Expand View
              </button>
            </div>
            <div className="h-[520px] w-full bg-slate-100 dark:bg-black/20">
              <iframe
                src={`${paper.fileUrl}#toolbar=0`}
                className="h-full w-full border-none"
                title={`${paper.subject.code} PDF`}
              />
            </div>
          </div>
        </div>

        {/* Question & Topics Breakdown */}
        <div className="flex flex-col gap-6">
          {/* Extracted Topics */}
          {Array.isArray(paper.extractedTopics) && paper.extractedTopics.length > 0 && (
            <div className="rounded-xl2 border border-slate-200 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-500">
                <Sparkles size={14} /> Key Topics in this Paper
              </div>
              <div className="flex flex-wrap gap-2">
                {paper.extractedTopics.map((t: any, i: number) => (
                  <span
                    key={i}
                    className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  >
                    {t.topic} ({t.frequency}x)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Questions */}
          <div className="rounded-xl2 border border-slate-200 bg-white p-5 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">
                Extracted Questions ({paper.questions.length})
              </h3>
            </div>

            {paper.questions.length === 0 ? (
              <p className="text-xs text-slate-400">
                Questions have not been parsed for this paper yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {paper.questions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/5 dark:bg-white/5"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-maroon-500">{q.questionNo}</span>
                      {q.marks && (
                        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {q.marks} Marks
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{q.text}</p>
                    {q.topic && (
                      <p className="mt-1 text-[10px] text-slate-400">Topic: {q.topic}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PdfModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={paper.fileUrl}
        title={`${paper.subject.code} — ${paper.examType} ${paper.year}`}
      />
    </div>
  );
}
