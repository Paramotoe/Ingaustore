"use client";

import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6">
      <div className="flex gap-3 overflow-x-auto rounded-2xl border border-border bg-surface p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-surface-elevated px-3 py-2 text-sm font-medium text-foreground"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
            S
          </span>
          Semua
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/kategori/${c.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-xs font-bold text-primary">
              {c.name.charAt(0)}
            </span>
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}