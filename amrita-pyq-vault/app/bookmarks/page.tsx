"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookmarksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
      Redirecting to home...
    </div>
  );
}
