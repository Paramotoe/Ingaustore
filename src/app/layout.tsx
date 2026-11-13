import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import SessionProvider from "@/components/SessionProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ingaustore — Katalog Produk Premium",
  description: "Jelajahi koleksi pilihan Ingaustore. Temukan produk favoritmu di marketplace.",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('ingaustore-theme');
    var theme = stored;
    if (!theme) {
      var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = dark ? 'midnight-neon' : 'aurora-light';
    }
    var allowed = ['aurora-light','ivory-luxe','midnight-neon','obsidian-gold'];
    if (allowed.indexOf(theme) === -1) theme = 'aurora-light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'aurora-light');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <SessionProvider>
            <Suspense fallback={<div className="h-16" />}>
              <SiteHeader />
            </Suspense>
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}