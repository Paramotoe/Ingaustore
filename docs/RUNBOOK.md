# Runbook — Ingaustore

## Environment Variables (nama saja)
DATA_MODE, DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_TRUST_HOST,
ADMIN_EMAIL, ADMIN_PASSWORD_HASH, CLOUDINARY_CLOUD_NAME,
CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.

## Cara Deploy
1. Push ke `main`.
2. Netlify auto-build dari `netlify.toml`.
3. Jika DB schema berubah: jalankan `npx prisma migrate deploy` (dengan DIRECT_URL) sebelum/perbarengan deploy.

## Inisialisasi/Reset Password Admin (aman)
1. Generate hash: `node -e "console.log(require('bcryptjs').hashSync('PASSWORD',10))"`.
2. Set `ADMIN_PASSWORD_HASH` di env.
3. Jalankan `npm run db:seed` (idempotent: tidak menimpa admin yang sudah ada).
4. Jangan cetak password/hash di log.

## Backup & Restore
- Neon: gunakan fitur backup/restore sesuai paket free (manual snapshot 1, instant restore 6 jam).
- Sebelum migration destruktif: backup manual.
- Restore: gunakan Neon console; dokumentasikan tanggal & hash commit.

## Cleanup & Retry
- Tabel `file_cleanup_job` menyimpan pekerjaan penghapusan aset.
- Status: pending / done / failed. attempts max 5 (backoff).
- Jalankan retry via script/cron yang memanggil endpoint internal (lindungi dari akses publik).
- Orphan cleanup: aset yang diunggah tapi tidak ditautkan dalam 24 jam.

## Monitoring Kuota
- Netlify: 300 credits/bulan. Pantau di dashboard. Jika habis → semua proyek pause.
- Neon: 1GB storage, 100 CU-hours/bulan, 5GB egress. Compute suspends jika habis.
- Cloudinary: 25 credits/bulan. Pantau credits.
- Perilaku saat kuota habis: layanan di-pause sampai siklus berikutnya (tidak ada overage charge).

## Rollback & Batasannya
- Rollback kode: redeploy commit sebelumnya via Netlify.
- Rollback DB: migration tidak otomatis dibatalkan; restore dari backup Neon atau manual.
- Batas: data yang dibuat setelah migration tidak otomatis hilang saat rollback kode.

## Tanggung Jawab Berkala (pemilik)
- Review kuota bulanan.
- Jalankan cleanup retry jika ada job failed.
- Backup DB sebelum migration.
- Pantau log error (tanpa secret).