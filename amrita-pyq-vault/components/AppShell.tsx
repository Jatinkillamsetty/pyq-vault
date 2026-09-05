"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Sidebar, { SidebarUser } from "@/components/Sidebar";

const AUTH_ROUTES = ["/login", "/signup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const isAuthRoute = AUTH_ROUTES.includes(pathname ?? "");

  // Login/signup pages get the full-width, sidebar-free layout.
  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Middleware already redirects unauthenticated visitors to /login, so this
  // is just a brief loading state while the session resolves client-side.
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light text-sm text-slate-400 dark:bg-surface-dark">
        Loading…
      </div>
    );
  }

  const user: SidebarUser = {
    name: session?.user?.name ?? "Guest",
    email: session?.user?.email ?? "",
    role: (session?.user as any)?.role ?? "STUDENT",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={user}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        onSignOut={() => signOut({ callbackUrl: "/login" })}
      />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
