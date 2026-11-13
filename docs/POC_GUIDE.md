# Proof of Concept (PoC) — Ingaustore

Panduan integrasi Netlify + Neon + Cloudinary. Jalankan dengan data dummy.
Jangan gunakan database produksi. Jangan aktifkan billing.

## 0. Environment Variables (isi di dashboard, bukan di Git)

### Netlify (Site settings → Environment variables)
- `DATABASE_URL` (Neon pooled connection string)
- `DIRECT_URL` (Neon direct connection string, untuk migration)
- `AUTH_SECRET` (minimal 32 karakter, cryptographically secure)
- `AUTH_TRUST_HOST` = `true`
- `ADMIN_EMAIL` (email admin pengujian)
- `ADMIN_PASSWORD_HASH` (bcrypt hash password pengujian)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Lokal (.env, gitignored)
Salin dari `.env.example` dan isi nilai pengujian.

## 1. Deploy Netlify (pengujian)
1. Push repo ke GitHub/GitLab.
2. Di Netlify: "Add new site" → Import from Git.
3. Build command: `npm run build` (sudah di netlify.toml).
4. Deploy. Catat URL pengujian.
5. Verifikasi: beranda, `/produk/[slug]` dapat diakses.
6. Verifikasi: env var server tidak muncul di bundle frontend (cek Network tab, tidak ada secret).

## 2. Neon + Prisma (pengujian)
1. Buat project Neon (free tier). Catat pooled & direct connection string.
2. Set `DATABASE_URL` & `DIRECT_URL` di Netlify & lokal. Set `DATA_MODE=database`.
3. Review migration.sql terhadap schema final (sudah di repo: `prisma/migrations/20260101000000_init/migration.sql`).
4. Pastikan DB target kosong (cek tabel). Jika sudah ada tabel/data, hentikan dan laporkan.
5. Jalankan migration pada DB PoC:
   - `npx prisma migrate deploy` (dengan DIRECT_URL)
6. Deploy ulang Netlify (Netlify tidak auto-migrate).
7. Uji CRUD data dummy via API.
5. Uji CRUD data dummy via API (curl/Postman):
   - POST /api/admin/categories (dengan session)
   - POST /api/admin/products
   - GET /api/products
   - PATCH /api/admin/products/:id
   - DELETE /api/admin/products/:id
6. Verifikasi koneksi dari runtime Netlify (bukan hanya lokal).

## 3. Inisialisasi Admin
1. Generate bcrypt hash password pengujian (lokal):
   - `node -e "const b=require('bcryptjs'); console.log(b.hashSync('TEST_PASSWORD',10))"`
2. Set `ADMIN_EMAIL` & `ADMIN_PASSWORD_HASH` di env.
3. Jalankan seed: `npm run db:seed` (lokal, dengan DATABASE_URL pengujian).
4. Uji login benar, login salah, logout, akses tanpa session.
5. Uji endpoint admin tanpa session → 401.

## 4. Cloudinary
1. Buat akun Cloudinary (free). Catat cloud_name, api_key, api_secret.
2. Set env di Netlify.
3. Uji signature: POST /api/admin/uploads/signature (dengan session) → returns signature.
4. Upload 1 foto valid dari browser → Cloudinary.
5. Verify: POST /api/admin/uploads/verify → metadata tersimpan.
6. Uji penolakan file invalid (format/size/dimensi) → 400.
7. Verifikasi API secret tidak terekspos ke browser (Network tab).

## 5. Alur End-to-End
1. Buat kategori dummy (admin).
2. Buat produk nonaktif + upload 2 foto → simpan metadata → aktifkan.
3. Buka katalog & detail produk tanpa login.
4. Uji slider, urutan foto, link marketplace.
5. Edit nama & harga → pastikan slug tetap.
6. Nonaktifkan produk → pastikan hilang dari katalog & detail publik 404.
7. Aktifkan kembali, ganti foto, hapus produk.
8. Verifikasi pembaruan cache & penghapusan aset (file_cleanup_job).

## 6. Cleanup & Kegagalan
1. Upload foto yang tidak ditautkan ke produk → tunggu orphan cleanup (gunakan timestamp pengujian).
2. Uji kegagalan penghapusan aset → verifikasi retry (file_cleanup_job status).
3. Buktikan proses cleanup dapat dijalankan (script/cron).

## Laporan Hasil
Untuk setiap pengujian: Status (PASS/FAIL/BELUM DIUJI), bukti singkat (tanpa secret), kendala & perbaikan.

Sertakan:
- URL deployment pengujian.
- Ringkasan migration.
- Daftar nama env var (tanpa nilai).
- Cara menjalankan cleanup & retry.
- Penggunaan kuota selama PoC.
- Data dummy yang sudah dibersihkan atau tersisa.

Jika semua pengujian wajib lulus, ajukan kelanjutan integrasi Tahap 3.