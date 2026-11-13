"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCategories } from "@/lib/mock-data";

export default function NewProductPage() {
  const router = useRouter();
  const categories = getCategories();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // SIMULASI: penyimpanan nyata di Tahap 3.
    alert("Simulasi: produk akan dibuat (Tahap 3 menyimpan ke database).");
    router.push("/admin/products");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Tambah Produk (Simulasi)</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Nama produk" required>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Kode produk (opsional)">
          <input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Harga (Rupiah)" required>
          <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Kategori" required>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className={inputCls}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Deskripsi (opsional)">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputCls} />
        </Field>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Produk unggulan
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Aktif (tampil di katalog)
          </label>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-surface-elevated p-4 text-sm text-muted-foreground">
          Upload foto: simulasi. Di Tahap 3, unggah via POST /api/admin/uploads.
        </div>
        <div className="flex gap-3">
          <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary">
            Simpan
          </button>
          <button type="button" onClick={() => router.back()} className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "mt-1 h-11 w-full rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}