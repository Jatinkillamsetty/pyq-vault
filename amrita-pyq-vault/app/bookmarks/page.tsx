"use client";

import { useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import PaperCard, { PaperCardData } from "@/components/PaperCard";
import Link from "next/link";

export default function BookmarksPage() {
  const [papers, setPapers] = useState<PaperCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const res = await fetch("/api/bookmarks");
        if (res.ok) {
          const data = await res.json();
          setPapers(data.map((b: any) => ({ ...b, isBookmarked: true })));
        }
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500">
          <Bookmark size={14} /> Personal Collection
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-50">
          My Bookmarks
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quick access to all papers you've saved for revision.
        </p>
      </div>

      {loading ? (
        <div className="flex py-20 justify-center items-center gap-2 text-slate-400">
          <Loader2 size={20} className="animate-spin text-maroon-500" />
          <span className="text-sm">Loading bookmarked papers…</span>
        </div>
      ) : papers.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-slate-300 py-16 text-center dark:border-white/10">
          <Bookmark size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="font-display text-base text-slate-600 dark:text-slate-300">
            No bookmarked papers yet.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Click the bookmark icon on any paper card to save it here for quick access.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-maroon-500 px-4 py-2 text-xs font-medium text-white hover:bg-maroon-600"
          >
            Browse Papers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}
