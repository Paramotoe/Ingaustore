"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProductById, getCategories } from "@/lib/mock-data";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const product = getProductById(id);
  const categories = getCategories();

  const [name, setName] = useState(product?.name ?? "");
  const [code, setCode] = useState(product?.code ?? "");
  const [price, setPrice] = useState(product ? String(product.priceIdr) : "");
  const [categoryId, setCategoryId] = useState(product?.category.id ?? (categories[0]?.id ?? ""));
  const [description, setDescription] = useState(product?.description ?? "");
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.localStorage.getItem("ingaustore-admin")) {
      router.push("/admin/login");
    }
  }, [router]);

  if (!product) {
    return <div className="mx-auto max-w-[1280px] px-4 py-10">Produk tidak ditemukan.</div>;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Simulasi: produk akan diubah (Tahap 3 menyimpan ke database).");
    router.push("/admin/products");
  };

  const inputCls = "mt-1 h-11 w-full rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Produk (Simulasi)</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Slug: <span className="font-mono">{product.slug}</span> (read-only)
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground">Nama produk *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Kode produk (opsional)</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Harga (Rupiah) *</label>
          <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Kategori *</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={inputCls}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Deskripsi (opsional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputCls} />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Produk unggulan
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Aktif
          </label>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-surface-elevated p-4 text-sm text-muted-foreground">
          Foto produk: simulasi. Di Tahap 3, kelola via upload & reorder.
        </div>
        <div className="flex gap-3">
          <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary">
            Simpan Perubahan
          </button>
          <button type="button" onClick={() => router.back()} className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}