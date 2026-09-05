"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Bot, Send, User, Sparkles, Database, Loader2, ArrowRight } from "lucide-react";

import FormattedMessage from "@/components/FormattedMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Show me Kinematics formulas and projectile PYQs",
  "Explain Mole Concept with solved JEE Main questions",
  "What are the key formulas for Quadratic Equations?",
  "Explain VSEPR Theory and Chemical Bonding geometries",
];

export default function AiAssistantPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your PYQ AI Assistant, connected directly to the Amrita PYQ Database. Ask me about repeated questions, important topics, marks weightage, or specific algorithms across any past paper.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const replyText = res.ok
        ? data.reply
        : data.error || "Sorry, I encountered an error searching the PYQ database.";

      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          content: "Network connection error while contacting the PYQ database.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-5xl flex-col px-6 py-6 md:px-10">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-maroon-500 to-indigo-500 text-white shadow-glow-maroon">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
              PYQ AI Assistant
            </h1>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Database size={12} className="text-emerald-500" /> Grounded in official PYQ database
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(prompt)}
            disabled={loading}
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-indigo-400/40"
          >
            <Sparkles size={12} className="text-indigo-500" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto space-y-4 rounded-xl2 border border-slate-200 bg-white p-5 dark:border-white/5 dark:bg-white/[0.02]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${
                msg.role === "user" ? "bg-maroon-500" : "bg-indigo-600"
              }`}
            >
              {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-maroon-500 text-white"
                  : "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-100"
              }`}
            >
              <FormattedMessage content={msg.content} isUser={msg.role === "user"} />
              <span
                className={`mt-1.5 block text-[10px] ${
                  msg.role === "user" ? "text-white/70" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
              <Bot size={14} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500 dark:bg-white/10 dark:text-slate-400">
              <Loader2 size={14} className="animate-spin text-indigo-500" />
              Searching database and generating answer…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about previous year questions, topics, or trends…"
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center justify-center rounded-xl bg-maroon-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-maroon-600 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
