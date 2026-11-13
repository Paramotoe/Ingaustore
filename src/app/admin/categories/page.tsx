"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCategories } from "@/lib/mock-data";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Category[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("ingaustore-admin")) {
      router.push("/admin/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems([...getCategories()]);
    setReady(true);
  }, [router]);

  if (!ready) return <div className="mx-auto max-w-[1280px] px-4 py-10">Memuat...</div>;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kelola Kategori (Simulasi)</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tahap 2: data in-memory.</p>
        </div>
        <button
          onClick={() => alert("Simulasi: tambah kategori (Tahap 3).")}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary"
        >
          Tambah Kategori
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Urutan</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
              .map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.sortOrder ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => alert("Simulasi: edit kategori (Tahap 3).")}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => alert("Simulasi: hapus kategori (Tahap 3). Kategori yang masih dipakai produk tidak boleh dihapus.")}
                      className="ml-3 text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href="/admin/products" className="text-sm text-primary hover:underline">
          ← Kembali ke produk
        </Link>
      </div>
    </div>
  );
}