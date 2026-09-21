import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teamora — Workforce Management & Workplace Social Platform",
  description: "Modern, responsive internal workforce portal uniting attendance, workplace feed, daily worksheets, and company administration.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#f8fafc]">
      <body className="min-h-full text-slate-900 bg-[#f8fafc]">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
