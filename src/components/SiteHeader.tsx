"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/cari?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto max-w-[1280px] px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary font-bold">
              I
            </span>
            <span className="text-lg font-semibold tracking-tight">Ingaustore</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className={pathname === "/" ? "text-foreground font-medium" : "hover:text-foreground"}>Beranda</Link>
            <Link href="/#koleksi" className="hover:text-foreground">Koleksi</Link>
            <Link href="/#semua-produk" className="hover:text-foreground">Semua Produk</Link>
          </nav>

          <div className="flex items-center gap-3">
            <form onSubmit={submitSearch} className="hidden md:block">
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari produk..."
                aria-label="Cari produk"
                className="h-10 w-56 rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
            </form>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={submitSearch} className="mt-3 md:hidden">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk..."
            aria-label="Cari produk"
            className="h-11 w-full rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
        </form>

        <nav className="mt-3 flex md:hidden items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Beranda</Link>
          <Link href="/#koleksi" className="hover:text-foreground">Koleksi</Link>
          <Link href="/#semua-produk" className="hover:text-foreground">Semua Produk</Link>
        </nav>
      </div>
    </header>
  );
}