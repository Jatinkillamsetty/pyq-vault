import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "JEE PYQ Vault — Chapter-Wise JEE Main & Advanced Practice Platform",
  description:
    "The ultimate chapter-wise JEE Main and Advanced previous year question bank, AI study planner, and interactive practice canvas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-body bg-surface-light text-slate-800 antialiased dark:bg-surface-dark dark:text-slate-200"
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
