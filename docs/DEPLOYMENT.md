# Deployment Guide — Ingaustore

## Stack
- Hosting: Netlify Free (Next.js via Netlify adapter, zero config).
- Database: Neon PostgreSQL Free + Prisma ORM.
- Foto: Cloudinary Free (Image & Video API, signed upload).
- Auth: Auth.js v5 (Credentials, bcryptjs, JWT 8 jam).

## Environment Variables (nama saja, tanpa nilai)
### Build-time & Runtime (Netlify Site settings → Environment variables)
- `DATA_MODE` = `database` (wajib pada PoC/produksi)
- `DATABASE_URL` (Neon pooled)
- `DIRECT_URL` (Neon direct, untuk migration)
- `AUTH_SECRET` (min 32 char)
- `AUTH_TRUST_HOST` = `true`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH` (bcrypt hash)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Lokal (.env, gitignored)
Salin dari `.env.example`. Set `DATA_MODE=mock` untuk dev tanpa DB.

## Deploy Steps
1. Push ke `main` (sudah terkonfigurasi).
2. Netlify: import repo → branch `main` → build auto-detect dari `netlify.toml`.
3. Set env var di atas.
4. Buat project Neon (free) → isi `DATABASE_URL`/`DIRECT_URL`.
5. Verifikasi DB kosong (cek tabel). Jika ada data, hentikan.
6. Jalankan migration: `npx prisma migrate deploy` (dengan `DIRECT_URL`).
7. Generate admin hash (lokal): `node -e "console.log(require('bcryptjs').hashSync('PASSWORD',10))"` → set `ADMIN_PASSWORD_HASH`.
8. Seed admin: `npm run db:seed`.
9. Buat akun Cloudinary (free) → set `CLOUDINARY_*`.
10. Redeploy Netlify.

## Migration
- File: `prisma/migrations/20260101000000_init/migration.sql` + `migration_lock.toml`.
- Terapkan: `npx prisma migrate deploy`.
- Jangan `migrate reset` atau `db push` tanpa persetujuan.
- Review SQL terhadap schema final sebelum apply.

## Rollback
- Rollback kode: redeploy commit sebelumnya via Netlify.
- Rollback DB: migration tidak otomatis dibatalkan; restore dari backup Neon (jika tersedia) atau manual. Dokumentasikan sebelum produksi.

## Kuota & Risiko
- Netlify Free: 300 credits/bulan (hard limit → pause semua proyek). ~15GB bandwidth jika seluruh kredit untuk bandwidth.
- Neon Free: 1GB storage, 100 CU-hours/bulan, 5GB egress. Compute suspends jika kuota habis.
- Cloudinary Free: 25 credits/bulan (shared). Jika melebihi, layanan terbatas.
- Tidak ada overage charge; layanan di-pause sampai siklus berikutnya.