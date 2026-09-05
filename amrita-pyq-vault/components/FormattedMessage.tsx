"use client";

import React from "react";

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

// Clean LaTeX symbols to clean Unicode math notation
function formatLatexMath(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    .replace(/\\pm/g, "±")
    .replace(/\\ge/g, "≥")
    .replace(/\\le/g, "≤")
    .replace(/\\theta/g, "θ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\pi/g, "π")
    .replace(/\\cdot/g, "·")
    .replace(/\\infty/g, "∞")
    .replace(/\\quad/g, " ")
    .replace(/\\to|\\rightarrow/g, "→")
    .replace(/\\implies/g, "⇒")
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\^n/g, "ⁿ")
    .replace(/_1/g, "₁")
    .replace(/_2/g, "₂")
    .replace(/_n/g, "ₙ")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\/g, "");
}

// Helper to render bold text **text** and inline math $math$
function renderTextWithFormatting(text: string, isUserMessage: boolean = false) {
  // Split inline math $ ... $
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$|\*\*[^*]+?\*\*)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    // Display Math block $$ ... $$
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const mathBody = formatLatexMath(part.slice(2, -2).trim());
      return (
        <div
          key={i}
          className="my-2 overflow-x-auto rounded-xl border border-indigo-200 bg-indigo-50/60 px-3.5 py-2 font-mono text-xs font-semibold text-indigo-900 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200"
        >
          {mathBody}
        </div>
      );
    }

    // Inline Math $ ... $
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const mathBody = formatLatexMath(part.slice(1, -1).trim());
      return (
        <span
          key={i}
          className="mx-0.5 inline-block rounded bg-indigo-100/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
        >
          {mathBody}
        </span>
      );
    }

    // Bold text **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong
          key={i}
          className={isUserMessage ? "font-bold text-white" : "font-semibold text-slate-900 dark:text-slate-50"}
        >
          {boldText}
        </strong>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

export default function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  if (!content) return null;

  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Process markdown lines
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-4 list-disc text-slate-700 dark:text-slate-200">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Horizontal Divider ---
    if (trimmed === "---" || trimmed === "***") {
      flushList();
      elements.push(
        <hr key={index} className="my-3 border-slate-200 dark:border-white/10" />
      );
      return;
    }

    // Headers ### or ## or #
    if (trimmed.startsWith("#")) {
      flushList();
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const headerText = trimmed.replace(/^#+\s*/, "");

      if (level === 1) {
        elements.push(
          <h2 key={index} className="mt-3 mb-2 font-display text-lg font-bold text-maroon-600 dark:text-maroon-400">
            {renderTextWithFormatting(headerText)}
          </h2>
        );
      } else if (level === 2) {
        elements.push(
          <h3 key={index} className="mt-3 mb-1.5 font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            {renderTextWithFormatting(headerText)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={index} className="mt-2 mb-1 font-display text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {renderTextWithFormatting(headerText)}
          </h4>
        );
      }
      return;
    }

    // Display Math line $$ ... $$
    if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4) {
      flushList();
      const mathBody = formatLatexMath(trimmed.slice(2, -2).trim());
      elements.push(
        <div
          key={index}
          className="my-2 overflow-x-auto rounded-xl border border-indigo-200 bg-indigo-50/60 px-3.5 py-2 font-mono text-xs font-semibold text-indigo-900 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200"
        >
          {mathBody}
        </div>
      );
      return;
    }

    // Bullet List items (* or - or •)
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      inList = true;
      const itemContent = trimmed.replace(/^[*•-]\s*/, "");
      listItems.push(
        <li key={index} className="leading-relaxed">
          {renderTextWithFormatting(itemContent)}
        </li>
      );
      return;
    }

    // Empty lines
    if (!trimmed) {
      flushList();
      return;
    }

    // Normal paragraph line
    flushList();
    elements.push(
      <p key={index} className="my-1.5 leading-relaxed">
        {renderTextWithFormatting(line)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1 text-xs">{elements}</div>;
}
