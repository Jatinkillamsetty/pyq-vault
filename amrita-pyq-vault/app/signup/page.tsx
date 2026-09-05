"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAmritaEmail = /@am\.students\.amrita\.edu$/i.test(email.trim());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Auto sign-in right after successful signup
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (signInRes?.error) {
        // Account was created but auto-login failed — send them to log in manually.
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl2 bg-gradient-to-br from-maroon-500 to-indigo-500 font-display text-sm font-bold text-white shadow-glow-maroon">
            PV
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Only for Amrita Vishwa Vidyapeetham students
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
            Full name
          </label>
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-indigo-400 dark:border-white/10 dark:bg-white/5">
            <User size={15} className="shrink-0 text-slate-400" />
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student Name"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
          </div>

          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Student email
          </label>
          <div
            className={`mb-1.5 flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 focus-within:border-indigo-400 dark:bg-white/5 ${
              email && !isAmritaEmail
                ? "border-amber-300 dark:border-amber-400/40"
                : "border-slate-200 dark:border-white/10"
            }`}
          >
            <Mail size={15} className="shrink-0 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@am.students.amrita.edu"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
            {email && isAmritaEmail && (
              <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
            )}
          </div>
          {email && !isAmritaEmail ? (
            <p className="mb-4 text-[11px] text-amber-600 dark:text-amber-400">
              Student email must end in @am.students.amrita.edu
            </p>
          ) : (
            <p className="mb-4 text-[11px] text-slate-400">
              Must end in @am.students.amrita.edu
            </p>
          )}

          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Password
          </label>
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-indigo-400 dark:border-white/10 dark:bg-white/5">
            <Lock size={15} className="shrink-0 text-slate-400" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isAmritaEmail}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-maroon-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-maroon-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Create account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-maroon-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
