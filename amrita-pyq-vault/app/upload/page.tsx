"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { BRANCHES } from "@/lib/demoData";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [branchCode, setBranchCode] = useState("Physics");
  const [semester, setSemester] = useState<number>(3);
  const [regulation, setRegulation] = useState<string>("R2021");
  const [examType, setExamType] = useState<string>("END_SEM");
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [aiLoading, setAiLoading] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are allowed.");
        setFile(null);
        return;
      }
      if (selected.size > 15 * 1024 * 1024) {
        setError("File size must be under 15MB.");
        setFile(null);
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleAutoTag = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }
    setError(null);
    setAiLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/auto-tag", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gemini extraction failed.");
        return;
      }

      if (data.subject_code) setSubjectCode(data.subject_code);
      if (data.subject_name) setSubjectName(data.subject_name);
      if (data.year) setYear(data.year);
      if (data.exam_type) setExamType(data.exam_type);
      if (typeof data.confidence === "number") setAiConfidence(data.confidence);
    } catch (err) {
      console.error(err);
      setError("AI auto-tagging failed. Please enter details manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }
    if (!subjectCode || !subjectName) {
      setError("Subject code and name are required.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("subjectCode", subjectCode);
      formData.append("subjectName", subjectName);
      formData.append("branchCode", branchCode);
      formData.append("semester", String(semester));
      formData.append("regulation", regulation);
      formData.append("examType", examType);
      formData.append("year", String(year));

      const res = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to upload paper.");
        return;
      }

      setSuccessMsg(data.message || "Paper uploaded successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Network error while uploading paper.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      <div className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-maroon-500">
          Amrita Vishwa Vidyapeetham
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-slate-50">
          Upload Previous Paper
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Share question papers to help your fellow students prepare.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-medium text-maroon-600 dark:bg-red-500/10 dark:text-maroon-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* File Dropzone */}
        <div className="relative flex flex-col items-center justify-center rounded-xl2 border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:border-indigo-400 dark:border-white/10 dark:hover:border-indigo-400/40">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-white/5">
            <UploadCloud size={24} />
          </div>
          {file ? (
            <div>
              <p className="font-display text-sm font-medium text-slate-800 dark:text-slate-100">
                {file.name}
              </p>
              <p className="text-xs text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB PDF
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Drop your PYQ PDF here or click to browse
              </p>
              <p className="mt-1 text-xs text-slate-400">
                PDF format only, maximum size 15MB
              </p>
            </div>
          )}
        </div>

        {/* Auto-Tag with Gemini AI button */}
        {file && (
          <div className="flex items-center justify-between rounded-xl bg-indigo-50/70 p-4 dark:bg-indigo-500/10">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              <div>
                <p className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
                  AI Metadata Extraction
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  Auto-extract subject code, name, year, and exam type from PDF cover page.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoTag}
              disabled={aiLoading}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Auto-fill with AI
            </button>
          </div>
        )}

        {aiConfidence !== null && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            AI Extraction Confidence: {Math.round(aiConfidence * 100)}%. Please verify the fields below.
          </p>
        )}

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Subject Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 23ECE211"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Subject Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Microcontrollers & Interfacing"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Branch / Department
            </label>
            <select
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            >
              <optgroup label="🔵 Physics">
                <option value="Physics">Physics (24 Units)</option>
              </optgroup>
              <optgroup label="🟢 Chemistry">
                <option value="Physical Chemistry">Physical Chemistry (Units 1-11)</option>
                <option value="Inorganic Chemistry">Inorganic Chemistry (Units 12-21)</option>
                <option value="Organic Chemistry">Organic Chemistry (Units 22-32)</option>
              </optgroup>
              <optgroup label="🔴 Mathematics">
                <option value="Mathematics">Mathematics (28 Units)</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Regulation
            </label>
            <select
              value={regulation}
              onChange={(e) => setRegulation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            >
              <option value="R2019">R2019</option>
              <option value="R2021">R2021</option>
              <option value="R2023">R2023</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Exam Type
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            >
              <option value="MID_SEM">Mid-Sem</option>
              <option value="END_SEM">End-Sem</option>
              <option value="SUPPLEMENTARY">Supplementary</option>
              <option value="MODEL">Model</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Exam Year
            </label>
            <input
              type="number"
              required
              min={2015}
              max={2030}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitLoading || !file}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-maroon-500 py-3 text-sm font-medium text-white hover:bg-maroon-600 disabled:opacity-60"
        >
          {submitLoading && <Loader2 size={16} className="animate-spin" />}
          Submit Paper
        </button>
      </form>
    </div>
  );
}
