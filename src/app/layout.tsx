import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";

/* ── DESIGN.md Typography: Press Start 2P & Inter ──────── */
const pressStart2P = Press_Start_2P({
  variable: "--font-press-start-2p",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ngoding Santuy — Belajar Coding Santai Berbahasa Indonesia",
    template: "%s | Ngoding Santuy",
  },
  description:
    "Platform belajar coding interaktif berbahasa Indonesia dengan playground HTML/CSS/JS, learning paths, dan progress tracking.",
  keywords: ["coding", "belajar coding", "html", "css", "javascript", "indonesia", "programming"],
  authors: [{ name: "Ngoding Santuy" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Ngoding Santuy",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${pressStart2P.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

