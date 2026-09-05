"use client";

import {
  Home,
  LayoutGrid,
  Sparkles,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  BookOpen,
  Bot,
  Sun,
  Moon,
  ChevronsLeft,
  Target,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "JEE PYQs & Scratchpad", href: "/jee-practice", icon: Target },
  { label: "Browse Syllabus", href: "/browse", icon: LayoutGrid },
  { label: "AI Exam Cheatsheets", href: "/cheatsheets", icon: Sparkles },
  { label: "AI Study Planner", href: "/study-plan", icon: BookOpen },
  { label: "PYQ AI Assistant", href: "/ai", icon: Bot },
  { label: "My Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Upload Question", href: "/upload-question", icon: PlusCircle },
  { label: "Admin Control", href: "/admin", icon: ShieldCheck, adminOnly: true },
];

export interface SidebarUser {
  name: string;
  email: string; // e.g. someone@amrita.edu
  avatarUrl?: string;
  role: "STUDENT" | "MODERATOR" | "ADMIN";
}

export default function Sidebar({
  user,
  theme,
  onToggleTheme,
  onSignOut,
}: {
  user: SidebarUser;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onSignOut?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isVerifiedUser = Boolean(user && user.email);

  return (
    <aside
      className={`
        sticky top-0 flex h-screen flex-col justify-between
        border-r border-slate-200 bg-white/80 backdrop-blur-md
        transition-[width] duration-300 ease-out
        dark:border-white/5 dark:bg-surface-dark/80
        ${collapsed ? "w-[76px]" : "w-[260px]"}
      `}
    >
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl2 bg-gradient-to-br from-maroon-500 to-indigo-500 font-display text-sm font-bold text-white shadow-glow-maroon">
                PV
              </div>
              <div className="leading-tight">
                <p className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                  PYQ Vault
                </p>
                <p className="text-[11px] text-slate-400">Amrita Vishwa Vidyapeetham</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-slate-200"
          >
            <ChevronsLeft
              size={16}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-2 flex flex-col gap-1 px-3">
          {NAV_ITEMS.filter((item) => !item.adminOnly || user.role === "ADMIN").map(
            (item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                    transition-colors
                    ${
                      active
                        ? "bg-maroon-500/10 text-maroon-500 dark:bg-maroon-500/15 dark:text-maroon-400"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                    }
                  `}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-maroon-500" />
                  )}
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            }
          )}
        </nav>
      </div>

      {/* Footer: auth status + theme toggle */}
      <div className="border-t border-slate-200 p-3 dark:border-white/5">
        <div
          className="mb-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-2 py-2 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          {!collapsed && (
            <span className="truncate text-xs font-medium">
              Verified Account
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-100 dark:hover:bg-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                {user.name}
              </p>
              <p className="truncate text-[11px] text-slate-400">{user.email}</p>
            </div>
          )}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-100 hover:text-maroon-500 dark:hover:bg-red-500/10 dark:hover:text-maroon-400"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
