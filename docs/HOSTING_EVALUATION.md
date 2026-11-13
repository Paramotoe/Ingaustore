# Evaluasi Hosting — Ingaustore (Tahap 3)

## Keputusan Hosting
**Netlify Free** ($0/bulan, 300 credits/bulan, hard limit, penggunaan komersial diizinkan).
Tidak ada layanan berbayar diaktifkan. Upgrade hanya dengan persetujuan.

## Gate A — Frontend siap diintegrasikan
- [x] Beranda, katalog, detail produk berfungsi dengan mock data.
- [x] Pencarian, filter kategori, sort, pagination bekerja konsisten.
- [x] Galeri multi-foto & link marketplace berfungsi.
- [x] Empat tema diterapkan.
- [x] Layout responsif, tanpa horizontal overflow (build OK).
- [x] Loading, empty, error, not-found state tersedia.
- [x] UI admin produk & kategori tersedia (simulasi).
- [x] Tidak ada error build (next build lulus).
- [x] Struktur mock data selaras dengan API contract (priceIdr, images, links).
- [x] Data layer terpisah dari komponen UI.
- [x] Fitur simulasi didokumentasikan (banner "Simulasi").

## Gate B — Infrastruktur
- [x] Verifikasi paket gratis selesai (Neon, Netlify, Netlify Functions, Cloudinary).
- [x] Hosting mengizinkan penggunaan komersial (Netlify Free: diizinkan).
- [x] Database: Neon PostgreSQL Free + Prisma ORM (disetujui).
- [x] Penyimpanan foto: Cloudinary Free, Image and Video API (disetujui).
- [ ] Kompatibilitas runtime terbukti via PoC — **BELUM DIVERIFIKASI** (stack disetujui; lulus hanya setelah pengujian pada deployment Netlify).
- [x] Batas kuota & perilaku saat kuota habis didokumentasikan.
- [x] Tidak ada layanan berbayar diaktifkan.

## Opsi Database (pilih 1)

### DB-A — Neon Free (kandidat awal)
- 1 GB storage/proyek, 100 CU-hours/bulan, 5 GB egress/bulan. Compute suspends jika kuota habis.
- Tidak memerlukan payment method (free tier).
- Prisma via @prisma/adapter-neon (HTTP) — kompatibel Netlify Functions.
- Risiko: compute suspends saat kuota habis (katalog tidak bisa baca/tulis).

### DB-B — Netlify Database (managed Postgres)
- 3 database free, 20 active branch, 7-day backup. Co-located dengan Netlify.
- Tidak memerlukan payment method.
- Prisma via @prisma/adapter-pg (connection string).
- Risiko: lebih sedikit kontrol; batas branch/database.

**Rekomendasi:** DB-A (Neon) — lebih luas ekosistem, sudah direncanakan; DB-B sebagai fallback jika integrasi bermasalah.

## Opsi Penyimpanan Foto (pilih 1) — maksimal 2 opsi

### Storage-A — Cloudflare R2 (gratis, public URL)
- 10 GB storage, 1M Class A ops, 10M Class B ops/bulan, **egress gratis**.
- Public URL via custom domain → cocok untuk `<img src>`.
- Client direct-upload via presigned URL → bypass batas 4.5MB Netlify Function.
- Penggunaan komersial diizinkan (domain sendiri).
- **Memerlukan payment method on file** (checkout R2 subscription, meskipun free allowance).
- Image processing (WebP) tetap via Netlify Function (sharp) — OK karena Node runtime.
- Risiko: payment method on file; jika ops/storage melebihi free tier → biaya ($0.015/GB-month, $4.50/1M Class A).

### Storage-B — Netlify Blobs (gratis, tanpa payment method)
- 5 GB max/objek, draws dari credit pool (300 credits/bulan). Tidak ada public URL (serve via function).
- Tanpa payment method. Zero-config.
- Tidak ideal untuk foto produk publik (setiap read = function invocation + compute cost).
- Image processing tetap via Netlify Function.
- Risiko: credit pool bersama dengan traffic/build; foto populer bisa menghabiskan kredit.

**Rekomendasi:** Storage-A (R2) — public URL + free egress + client direct upload. Storage-B sebagai fallback jika tidak ingin payment method on file.

## PoC yang Diperlukan (sebelum Tahap 3)
1. Build & deploy Next.js ke Netlify (zero config).
2. Route dinamis detail produk (`/produk/[slug]`).
3. Auth.js Credentials + hashing (bcryptjs) + cookie session (trustHost).
4. Prisma + Neon (koneksi, migration, query).
5. Pembaruan cache setelah CRUD (revalidate).
6. Upload & pemrosesan foto (sharp) + penghapusan.

## Potensi Biaya (jika Free tidak cukup)
- Netlify Personal: $9/bulan (1000 credits).
- Netlify Pro: $20/bulan (3000 credits).
- Neon Launch: $0.106/CU-hour, $0.35/GB-month.
- R2: $0.015/GB-month storage, $4.50/1M Class A (di atas free tier).

## Keputusan Diperlukan
1. DB-A atau DB-B?
2. Storage-A (R2, butuh payment method) atau Storage-B (Netlify Blobs)?
3. Setujui PoC sebelum integrasi penuh.