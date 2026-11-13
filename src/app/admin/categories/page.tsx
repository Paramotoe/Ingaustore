"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Gagal memuat");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      setError("Gagal memuat kategori.");
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

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Gagal menambah");
      setNewName("");
      await load();
    } catch {
      alert("Gagal menambah kategori.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Hapus kategori "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.status === 409) { alert("Kategori masih digunakan produk. Pindahkan produk terlebih dahulu."); return; }
      if (!res.ok) throw new Error("Gagal hapus");
      await load();
    } catch {
      alert("Gagal menghapus kategori.");
    }
  };

  if (status === "loading" || loading) return <div className="mx-auto max-w-[1280px] px-4 py-10">Memuat...</div>;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kelola Kategori</h1>
          <p className="mt-1 text-sm text-muted-foreground">{session?.user?.email}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground">
          Logout
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500" role="alert">{error}</p>}

      <form onSubmit={add} className="mt-6 flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama kategori baru"
          className="h-11 flex-1 rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
        />
        <button type="submit" disabled={submitting || !newName.trim()} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary disabled:opacity-60">
          {submitting ? "Menyimpan..." : "Tambah"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produk</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{c.name}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{c.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.productCount ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(c.id, c.name)} className="text-red-500 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Belum ada kategori.</td>
              </tr>
            )}
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