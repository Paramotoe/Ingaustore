"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products");
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Gagal memuat produk");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      setError("Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/admin/login"); return; }
    if (status === "authenticated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load();
    }
  }, [status, load, router]);

  const remove = async (id: string) => {
    const p = items.find((x) => x.id === id);
    if (!p) return;
    if (!window.confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      alert("Gagal menghapus produk. Coba lagi.");
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)));
    } catch {
      alert("Gagal mengubah status. Coba lagi.");
    }
  };

  if (status === "loading" || loading) return <div className="mx-auto max-w-[1280px] px-4 py-10">Memuat...</div>;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Produk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session?.user?.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary">
            Tambah Produk
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground">
            Logout
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-500" role="alert">{error}</p>}

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
                  <button onClick={() => toggleActive(p)} className={`rounded-full px-2 py-0.5 text-xs ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-primary hover:underline">Edit</Link>
                  <button onClick={() => remove(p.id)} className="ml-3 text-red-500 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada produk.</td>
              </tr>
            )}
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