"use client";

import { useState } from "react";
import { Eye, Download, FileText, Bookmark as BookmarkIcon, ExternalLink, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PdfModal from "@/components/PdfModal";

export interface PaperCardData {
  id: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  regulation: string;
  examType: "MID_SEM" | "END_SEM" | "SUPPLEMENTARY" | "MODEL";
  year: number;
  topTopic?: string;
  fileUrl: string;
  isBookmarked?: boolean;
}

const EXAM_TYPE_META: Record<
  PaperCardData["examType"],
  { label: string; ribbon: string }
> = {
  MID_SEM: { label: "Mid-Sem", ribbon: "bg-indigo-500" },
  END_SEM: { label: "End-Sem", ribbon: "bg-maroon-500" },
  SUPPLEMENTARY: { label: "Supplementary", ribbon: "bg-amber-500" },
  MODEL: { label: "Model", ribbon: "bg-slate-400" },
};

export default function PaperCard({
  paper,
  onDelete,
}: {
  paper: PaperCardData;
  onDelete?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [previewOpen, setPreviewOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(paper.isBookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const meta = EXAM_TYPE_META[paper.examType] || EXAM_TYPE_META.END_SEM;

  const trackRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem("recently_viewed_papers");
      let list: PaperCardData[] = stored ? JSON.parse(stored) : [];
      list = list.filter((p) => p.id !== paper.id);
      list.unshift(paper);
      localStorage.setItem("recently_viewed_papers", JSON.stringify(list.slice(0, 10)));
    } catch (e) {
      console.error("Error saving recently viewed paper:", e);
    }
  };

  const handleOpenPreview = () => {
    trackRecentlyViewed();
    setPreviewOpen(true);
  };

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setBookmarkLoading(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId: paper.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm(`Admin Action: Are you sure you want to delete ${paper.subjectCode} (${paper.year})?`)) {
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/papers/${paper.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (onDelete) onDelete(paper.id);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete paper.");
      }
    } catch (err) {
      console.error("Error deleting paper:", err);
      alert("Network error deleting paper.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl2 border border-slate-200 bg-white p-5 transition-shadow hover:shadow-glow-maroon dark:border-white/5 dark:bg-white/[0.03] dark:hover:shadow-glow-indigo">
        {/* Catalog-tab ribbon */}
        <div
          className={`absolute right-4 top-0 flex h-6 w-14 items-end justify-center rounded-b-md text-[10px] font-semibold uppercase tracking-wide text-white ${meta.ribbon}`}
        >
          <span className="pb-0.5">{paper.year}</span>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-white/5">
              <FileText size={18} />
            </div>

            <div className="mr-14 flex items-center gap-1">
              <button
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                title={bookmarked ? "Remove bookmark" : "Bookmark paper"}
                className={`rounded-lg p-1.5 transition-colors ${
                  bookmarked
                    ? "bg-maroon-50 text-maroon-500 dark:bg-maroon-500/20 dark:text-maroon-400"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
                }`}
              >
                <BookmarkIcon size={16} className={bookmarked ? "fill-current" : ""} />
              </button>

              {isAdmin && (
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  title="Admin: Delete paper from database"
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                >
                  {deleteLoading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              )}
            </div>
          </div>

          <p className="font-mono text-[11px] text-slate-400">{paper.subjectCode}</p>
          <Link
            href={`/papers/${paper.id}`}
            onClick={trackRecentlyViewed}
            className="group/title flex items-start gap-1"
          >
            <h3 className="mb-3 line-clamp-2 font-display text-base font-medium leading-snug text-slate-800 transition-colors group-hover/title:text-maroon-500 dark:text-slate-100 dark:group-hover/title:text-maroon-400">
              {paper.subjectName}
            </h3>
          </Link>

          <div className="mb-4 flex flex-wrap gap-1.5">
            <Badge>{paper.branch}</Badge>
            <Badge>Sem {paper.semester}</Badge>
            <Badge>Reg {paper.regulation}</Badge>
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              {meta.label}
            </Badge>
          </div>

          {paper.topTopic && (
            <p className="mb-4 text-xs text-slate-400">
              Most tested: <span className="text-slate-500 dark:text-slate-300">{paper.topTopic}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
          <button
            onClick={handleOpenPreview}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <Eye size={14} /> Preview
          </button>
          <Link
            href={`/papers/${paper.id}`}
            onClick={trackRecentlyViewed}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-maroon-500 py-2 text-xs font-medium text-white transition-colors hover:bg-maroon-600"
          >
            <ExternalLink size={14} /> Details
          </Link>
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              title="Admin: Delete Paper"
              className="flex items-center justify-center rounded-lg bg-red-50 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
            >
              {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
      </div>

      <PdfModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={paper.fileUrl}
        title={`${paper.subjectCode} — ${meta.label} ${paper.year}`}
      />
    </>
  );
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 ${className}`}
    >
      {children}
    </span>
  );
}
