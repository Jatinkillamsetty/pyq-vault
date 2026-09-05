import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Amrita PYQ Vault — Find any previous paper in 3 clicks",
  description:
    "The organized, domain-secured question paper vault for Amrita Vishwa Vidyapeetham students.",
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
