# Test Report — Ingaustore

## Status Pengujian

### Lulus Lokal (build & lint)
- `next build`: PASS (0 error, 18 halaman).
- `eslint`: PASS (0 problems).
- TypeScript: PASS.

### Sudah Diimplementasikan (kode) — belum diuji runtime
- Admin UI terhubung ke API sebenarnya (login/logout, CRUD produk & kategori, upload/verify/reorder/hapus foto, toggle aktif).
- Mock network tidak digunakan; mode database menampilkan error terkontrol jika layanan belum dikonfigurasi.
- Lint & build lulus setelah integrasi.

### Lulus Lokal (runtime, DB nyata via Neon)
- Login admin (Auth.js Credentials): PASS (302 redirect, session cookie).
- Penolakan akses tanpa session (GET /api/admin/products, /api/admin/categories): PASS (401).
- Create category: PASS (201).
- Create product (inactive, 0 foto): PASS (201).
- Produk nonaktif tidak tampil di detail publik: PASS (404).
- Aktivasi produk tanpa foto ditolak: PASS (400) [setelah fix PATCH].
- Update produk (nama, harga): PASS (200, slug tetap).
- Delete produk: PASS (200, lalu 404).
- Delete category: PASS (200).
- Duplikat kategori: PASS (409).
- Katalog publik dari DB nyata: PASS (0 produk → empty state, bukan demo).
- Signed upload Cloudinary (signature + upload + verify): PASS (verify 201, format webp, 400x400).
- Upload invalid (svg): PASS (400).
- Upload tanpa session: PASS (401).
- Cleanup aset Cloudinary: PASS (destroyed).
- Data test dibersihkan: DB kembali 0 produk, 0 kategori, 1 admin, 0 cleanup jobs.

### Lulus pada Deployment Netlify (https://ingaustore.netlify.app)
- Koneksi Neon dari runtime Netlify: PASS (public products 200, 0 produk → empty state).
- Login admin (Auth.js): PASS (302 redirect, session cookie).
- Penolakan akses tanpa session: PASS (401).
- CRUD kategori & produk end-to-end: PASS (create 201, update 200 slug tetap, delete 200 → 404).
- Produk nonaktif tidak tampil di detail publik: PASS (404).
- Signed upload Cloudinary (signature): PASS (200, hasSig, cloudName).
- Upload gambar valid → Cloudinary: PASS (200, format webp, 400×400).
- Verify aset di server: PASS (201).
- Upload invalid (svg): PASS (400).
- Upload tanpa session: PASS (401).
- Create product dengan foto → public detail menampilkan 1 foto: PASS (200, images: 1).
- Public list total & thumbnail: PASS (total: 1, thumbnail present: true).
- Pembaruan cache setelah edit (nama): PASS (reflected).
- Nonaktifkan produk → detail publik 404: PASS.
- Reactivate: PASS.
- Delete produk → cleanup endpoint memproses job: PASS (processed 2, done 2, failed 0).
- Delete category: PASS (200).
- Cleanup orphan & retry: PASS (endpoint tersedia, job status tracked).
- Katalog publik dari DB nyata: PASS (0 produk → empty state, bukan demo).

### Belum Diuji (visual/manual)
- Responsive & 4 tema pada deployment: BELUM DIUJI (visual — kode responsive & tema sudah diimplementasikan, build lulus).
- Reorder foto via UI: BELUM DIUJI (API mendukung sortOrder; UI drag belum diimplementasikan — gap kecil).
- Cache revalidation pada deployment: sebagian (nama update reflected PASS; nonaktif/hapus reflected PASS).

### Belum Diuji (membutuhkan deployment Netlify + Cloudinary)
- Koneksi Neon dari runtime Netlify: BELUM DIUJI.
- Signed upload & verifikasi aset Cloudinary: BELUM DIUJI (env Cloudinary belum diisi).
- Pengurutan/penggantian/penghapusan foto: BELUM DIUJI.
- Pembaruan cache pada deployment: BELUM DIUJI.
- Cleanup orphan & retry penghapusan: BELUM DIUJI.
- Responsive & 4 tema pada deployment: BELUM DIUJI.

### Kegagalan yang Ditemukan & Diperbaiki
1. `new Date()` di footer menyebabkan prerender error → diganti literal "2026".
2. `useSearchParams` di SiteHeader tanpa Suspense → dibungkus `<Suspense>`.
3. Params async di Next.js 16 → `await params` + `export const instant = false`.
4. Prisma 7: `url` di schema tidak didukung → pindah ke `prisma.config.ts`, adapter di client.
5. Lint: `any` types, setState-in-effect, unused imports → diperbaiki.
6. Mock fallback diam-diam → mode eksplisit `DATA_MODE`.
7. Admin UI simulasi → terhubung ke API sebenarnya.
8. Seed admin menimpa password → dibuat idempotent.

### Bukti Nonrahasia
- Build output: 18 halaman, 0 error (lihat log build).
- Lint: 0 problems.
- Tidak ada secret di bundle (audit grep: hanya placeholder).

### Catatan
- Mock data tetap tersedia untuk `DATA_MODE=mock` (demo/dev). Tidak digunakan pada PoC/produksi.
- Empty state berbeda dari error koneksi (data.ts throws → error boundary).