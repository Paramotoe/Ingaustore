"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

export default function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const category = sp.get("category") ?? "";
  const sort = sp.get("sort") ?? "newest";
  const search = sp.get("q") ?? sp.get("search") ?? "";

  const update = (patch: Record<string, string>) => {
    const params = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          defaultValue={search}
          key={search}
          placeholder="Cari nama atau kode produk..."
          aria-label="Cari produk"
          onKeyDown={(e) => {
            if (e.key === "Enter") update({ q: (e.target as HTMLInputElement).value });
          }}
          onBlur={(e) => update({ q: e.target.value })}
          className="h-10 w-full md:w-72 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />
        <select
          value={category}
          onChange={(e) => update({ category: e.target.value })}
          aria-label="Filter kategori"
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <select
        value={sort}
        onChange={(e) => update({ sort: e.target.value })}
        aria-label="Urutkan"
        className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
      >
        <option value="newest">Terbaru</option>
        <option value="price_asc">Harga Terendah</option>
        <option value="price_desc">Harga Tertinggi</option>
      </select>
    </div>
  );
}