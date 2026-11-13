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

### Belum Diuji (membutuhkan deployment + DB nyata)
- Koneksi Neon dari runtime Netlify: BELUM DIUJI.
- Login/logout & penolakan akses tanpa session (deployment): BELUM DIUJI.
- Signed upload & verifikasi aset Cloudinary: BELUM DIUJI.
- CRUD kategori/produk end-to-end: BELUM DIUJI.
- Katalog & detail dari DB nyata: BELUM DIUJI.
- Pengurutan/penggantian/penghapusan foto: BELUM DIUJI.
- Pembaruan cache: BELUM DIUJI.
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