"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Category } from "@/lib/types";

type ImageMeta = {
  provider: "cloudinary";
  assetId: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  altText: string | null;
  sortOrder: number;
};

export default function NewProductPage() {
  const router = useRouter();
  const { status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/admin/login"); return; }
    if (status === "authenticated") {
      fetch("/api/admin/categories").then((r) => r.json()).then((j) => {
        setCategories(j.data ?? []);
        if (j.data?.[0]) setCategoryId(j.data[0].id);
      });
    }
  }, [status, router]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      // 1. get signature
      const sigRes = await fetch("/api/admin/uploads/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      const sigJson = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigJson?.error?.message ?? "Gagal mendapatkan signature");
      const s = sigJson.data;

      // 2. upload directly to Cloudinary
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", s.apiKey);
      fd.append("timestamp", String(s.timestamp));
      fd.append("signature", s.signature);
      fd.append("folder", s.folder);
      fd.append("public_id", s.publicId);
      fd.append("transformation", s.transformation);

      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson?.error?.message ?? "Upload gagal");

      // 3. verify
      const verRes = await fetch("/api/admin/uploads/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: upJson.asset_id, publicId: upJson.public_id, secureUrl: upJson.secure_url, altText: null, sortOrder: images.length + 1 }),
      });
      const verJson = await verRes.json();
      if (!verRes.ok) throw new Error(verJson?.error?.message ?? "Verifikasi gagal");

      const meta = verJson.data as ImageMeta;
      setImages((prev) => [...prev, { ...meta, sortOrder: prev.length + 1 }]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sortOrder: i + 1 })));
  };

  const moveImage = (idx: number, dir: number) => {
    setImages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((img, i) => ({ ...img, sortOrder: i + 1 }));
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      if (isActive && images.length === 0) { setError("Produk aktif wajib memiliki minimal 1 foto."); return; }
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim() || null,
          description: description.trim() || null,
          priceIdr: Number(price),
          categoryId,
          isFeatured,
          isActive,
          images,
          links: [],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Gagal menyimpan");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan produk.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "mt-1 h-11 w-full rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring";

  if (status === "loading") return <div className="mx-auto max-w-[1280px] px-4 py-10">Memuat...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Tambah Produk</h1>
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
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Deskripsi (opsional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputCls} />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Produk unggulan
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Aktif
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Foto (max 6, min 1 jika aktif)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading || images.length >= 6}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              files.forEach((f) => uploadFile(f));
              e.target.value = "";
            }}
            className="mt-1 block w-full text-sm text-muted-foreground"
          />
          {uploading && <p className="mt-2 text-sm text-muted-foreground">Mengunggah...</p>}
          <div className="mt-3 grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div key={img.assetId} className="relative overflow-hidden rounded-xl border border-border bg-surface-elevated">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.secureUrl} alt="" className="aspect-square w-full object-cover" />
                <div className="absolute bottom-1 left-1 flex gap-1">
                  <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} aria-label="Pindah ke kiri" className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white disabled:opacity-40">←</button>
                  <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1} aria-label="Pindah ke kanan" className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white disabled:opacity-40">→</button>
                </div>
                <button type="button" onClick={() => removeImage(idx)} className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting || uploading} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary disabled:opacity-60">
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => router.back()} className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}