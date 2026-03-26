import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Cortex — Your Second Brain",
  description: "A local-first, privacy-focused second brain with visual thought networking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
