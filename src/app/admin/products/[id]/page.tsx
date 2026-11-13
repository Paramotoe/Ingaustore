"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Category } from "@/lib/types";

// re-declare ImageMeta locally to avoid circular import
type Img = {
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { status } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [slug, setSlug] = useState("");
  const [images, setImages] = useState<Img[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/admin/login"); return; }
    if (status !== "authenticated") return;
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories"),
        ]);
        if (pRes.status === 401) { router.push("/admin/login"); return; }
        const pJson = await pRes.json();
        const cJson = await cRes.json();
        const p = pJson.data;
        if (!p) throw new Error("Produk tidak ditemukan");
        setCategories(cJson.data ?? []);
        setName(p.name ?? "");
        setCode(p.code ?? "");
        setPrice(String(p.priceIdr ?? ""));
        setCategoryId(p.categoryId ?? "");
        setDescription(p.description ?? "");
        setIsFeatured(!!p.isFeatured);
        setIsActive(!!p.isActive);
        setSlug(p.slug ?? "");
        setImages((p.images ?? []).map((im: { assetId: string; publicId: string; secureUrl: string; width: number; height: number; bytes: number; format: string; altText?: string | null; sortOrder?: number }, idx: number) => ({
          provider: "cloudinary",
          assetId: im.assetId,
          publicId: im.publicId,
          secureUrl: im.secureUrl,
          width: im.width,
          height: im.height,
          bytes: im.bytes,
          format: im.format,
          altText: im.altText ?? null,
          sortOrder: im.sortOrder ?? idx + 1,
        })));
      } catch {
        setError("Gagal memuat produk.");
      } finally {
        setLoading(false);
      }
    })();
  }, [status, id, router]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const sigRes = await fetch("/api/admin/uploads/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
      });
      const sigJson = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigJson?.error?.message ?? "Gagal mendapatkan signature");
      const s = sigJson.data;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", s.apiKey);
      fd.append("timestamp", String(s.timestamp));
      fd.append("signature", s.signature);
      fd.append("folder", s.folder);
      fd.append("public_id", s.publicId);
      fd.append("eager", s.eager);
      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson?.error?.message ?? "Upload gagal");
      const verRes = await fetch("/api/admin/uploads/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: upJson.asset_id, publicId: upJson.public_id, secureUrl: upJson.secure_url, altText: null, sortOrder: images.length + 1 }),
      });
      const verJson = await verRes.json();
      if (!verRes.ok) throw new Error(verJson?.error?.message ?? "Verifikasi gagal");
      const meta = verJson.data;
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      if (isActive && images.length === 0) { setError("Produk aktif wajib memiliki minimal 1 foto."); return; }
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
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

  if (status === "loading" || loading) return <div className="mx-auto max-w-[1280px] px-4 py-10">Memuat...</div>;
  if (error && !name) return <div className="mx-auto max-w-[1280px] px-4 py-10 text-red-500">{error}</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Produk</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Slug: <span className="font-mono">{slug}</span> (read-only)
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
          <label className="block text-sm font-medium text-foreground">Foto (max 6)</label>
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
                <button type="button" onClick={() => removeImage(idx)} className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">✕</button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500" role="alert">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting || uploading} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary disabled:opacity-60">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button type="button" onClick={() => router.back()} className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-medium text-foreground">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}