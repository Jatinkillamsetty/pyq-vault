"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl2 bg-gradient-to-br from-maroon-500 to-indigo-500 font-display text-sm font-bold text-white shadow-glow-maroon">
            PV
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in with your email to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-xl2 p-6 shadow-glass dark:glass-dark dark:shadow-glass-dark"
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-maroon-600 dark:bg-red-500/10 dark:text-maroon-400">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Email address
          </label>
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-indigo-400 dark:border-white/10 dark:bg-white/5">
            <Mail size={15} className="shrink-0 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
          </div>

          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Password
          </label>
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-indigo-400 dark:border-white/10 dark:bg-white/5">
            <Lock size={15} className="shrink-0 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-maroon-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-maroon-600 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link href="/signup" className="font-medium text-maroon-500 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
