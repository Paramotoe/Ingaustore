"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { products as seedProducts } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

export default function AdminProductsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("ingaustore-admin")) {
      router.push("/admin/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems([...seedProducts]);
    setReady(true);
  }, [router]);

  const remove = (id: string) => {
    const p = items.find((x) => x.id === id);
    if (!p) return;
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  if (!ready) return <div className="mx-auto max-w-[1280px] px-4 py-10">Memuat...</div>;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Produk (Simulasi)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tahap 2: data in-memory. Autentikasi & penyimpanan nyata di Tahap 3.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary"
        >
          Tambah Produk
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kategori</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Harga</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.category.name}</td>
                <td className="px-4 py-3 text-foreground">{formatRupiah(p.priceIdr)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-primary hover:underline">Edit</Link>
                  <button onClick={() => remove(p.id)} className="ml-3 text-red-500 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href="/admin/categories" className="text-sm text-primary hover:underline">
          Kelola Kategori →
        </Link>
      </div>
    </div>
  );
}