# Verifikasi Paket Gratis — Ingaustore

Tanggal verifikasi: 13 Nov 2026. Sumber: dokumentasi resmi vendor.

## Tabel Verifikasi

| Layanan | Paket | Batas (Free/Hobby) | Sumber resmi | Dampak untuk Ingaustore | Risiko biaya | Rekomendasi |
|---|---|---|---|---|---|---|
| Neon (Postgres) | Free | 100 proyek/akun; 100 CU-hours/proyek/bulan; 1 GB storage/proyek (20 GB total); 5 GB egress/proyek/bulan; 10 branch/proyek; scale-to-zero 5 menit | neon.com/pricing, neon.com/docs/introduction/plans | Cukup untuk MVP katalog (1 DB, data kecil, traffic rendah). Compute suspends jika kuota habis (tidak ada overage). | Rendah pada free; jika traffic tinggi, upgrade Launch ($0.106/CU-hour, $0.35/GB-month). | Pakai free untuk MVP; monitor CU-hours & storage; re-evaluate sebelum produksi. |
| Prisma | ORM (bukan layanan) | Prisma Client/ORM gratis (open source). Prisma Data Platform (managed) opsional & berbayar. | prisma.io | Gunakan hanya Prisma ORM + migrasi; jangan aktifkan layanan terkelola tambahan. | Tidak ada jika hanya ORM. | Kunci: Prisma ORM saja, tanpa Prisma Data Platform. |
| Vercel Blob | Hobby | 1 GB storage; 10K simple ops/bulan; 2K advanced ops/bulan; 10 GB transfer/bulan. Hard limit: jika terlampaui, Blob diblokir sampai 30 hari. | vercel.com/docs/vercel-blob/usage-and-pricing | Upload foto produk: advanced ops (put) 2K/bulan. Untuk katalog kecil cukup. Client direct-upload wajib (server body limit 4.5MB). | Rendah pada hobby; jika katalog besar/traffic tinggi, Pro ($0.023/GB-month storage, $5/1M advanced ops). | Pakai hobby untuk MVP; batasi 6 foto/produk, kompres WebP; monitor ops. |
| Vercel (hosting) | Hobby | 100 GB Fast Data Transfer; 1M CDN requests; 1M function invocations; 4 Active CPU-hours; 100 deploy/hari; 200 proyek. **Hobby = non-komersial saja.** | vercel.com/docs/plans/hobby, vercel.com/docs/limits/fair-use-guidelines | **Ingaustore adalah katalog bisnis → penggunaan komersial. Hobby TIDAK diizinkan untuk komersial.** Memerlukan Pro ($20/bulan) atau alternatif hosting. | Tinggi jika tetap hobby (risiko penangguhan). Pro $20/bulan minimum. | **Keputusan diperlukan:** upgrade ke Vercel Pro ($20/bulan) atau pilih hosting alternatif sebelum produksi. |

## Cloudinary (Free) — storage yang dipilih

| Layanan | Paket | Batas (Free) | Sumber resmi | Dampak untuk Ingaustore | Risiko biaya | Rekomendasi |
|---|---|---|---|---|---|---|
| Cloudinary (Image & Video API) | Free | 25 credits/bulan (shared). ~10GB storage, 20K transformasi, 20GB bandwidth (tergantung komposisi). File max 10MB, transformasi terbatas. | cloudinary.com/pricing | Signed upload, server verify aset. Transformasi terbatas (thumbnail/kartu/detail). Cocok untuk foto produk. | Rendah (free tier). Jika melebihi, upgrade pay-as-you-go. | Pakai Free untuk MVP; monitor credits. Jangan gunakan Assets DAM. |

Catatan: Cloudinary Free adalah "Image and Video API", bukan trial Assets DAM.

## Netlify (Free) — tambahan verifikasi

| Layanan | Paket | Batas (Free) | Sumber resmi | Dampak untuk Ingaustore | Risiko biaya | Rekomendasi |
|---|---|---|---|---|---|---|
| Netlify (hosting) | Free | 300 credits/bulan (hard limit). Kredit: 10/GB-hour compute, 20/GB bandwidth, 2/10k requests, 15/production deploy. Saat habis, semua proyek di-pause sampai siklus berikutnya. | netlify.com/pricing, docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans | Penggunaan komersial diizinkan. Next.js didukung via OpenNext adapter (zero config). 300 credits ≈ 30 GB-hour compute atau ~15 GB bandwidth jika seluruhnya untuk bandwidth. | Rendah (tidak ada overage, tapi pause 30 hari). Jika traffic tinggi, upgrade Personal ($9/bulan, 1000 credits) atau Pro ($20/bulan, 3000 credits). | Pakai Free untuk MVP; monitor kredit; pindah ke Personal/Pro jika traffic melebihi. |
| Netlify Functions | Free | 60s sync execution, 1024MB memori (default), 6MB buffered request (4.5MB efektif binary), 20MB streamed response, 256KB background payload. | docs.netlify.com/build/functions/configuration | sharp untuk image processing berjalan (Node runtime). Upload 5MB melebihi 4.5MB efektif → perlu direct upload atau turunkan batas. | Rendah. | Gunakan direct upload (presigned URL) jika storage mendukung, atau turunkan max input ke 4MB. |
| Netlify Blobs | Free | 5GB max/objek, 2KB metadata. Tidak ada per-GB rate terpisah; draws dari credit pool (300 credits/bulan). Tidak ada public URL (baca via function). | docs.netlify.com/build/data-and-storage/netlify-blobs | Tidak ideal untuk foto produk publik (perlu function untuk serve → compute cost). Max 5GB/objek cukup. | Rendah (draws dari kredit). | Pertimbangkan sebagai alternatif; R2 lebih cocok untuk foto publik. |
| Netlify Database | Free | 3 database, 20 active branch, 7-day backup. Postgres managed. | docs.netlify.com (Netlify Database) | Alternatif Neon; co-located, sederhana. | Rendah. | Kandidat alternatif jika Neon bermasalah. |

## Layanan Tidak Digunakan (untuk menghindari kebingungan konfigurasi)
- **Netlify Blobs**: TIDAK DIGUNAKAN. Storage foto menggunakan Cloudinary. Netlify Blobs tidak memiliki public URL dan draws dari credit pool.
- **Netlify Database**: TIDAK DIGUNAKAN. Database menggunakan Neon PostgreSQL. Netlify Database hanya alternatif cadangan.
- **Vercel Blob / Vercel Hosting**: TIDAK DIGUNAKAN. Hosting menggunakan Netlify.

## Perilaku Kuota per Penyedia (verifikasi)

| Penyedia | Perilaku saat kuota habis | Pulih otomatis? |
|---|---|---|
| Netlify Free | Semua proyek di-pause sampai siklus billing berikutnya (30 hari). Tidak ada overage. | Ya, pada siklus berikutnya. |
| Neon Free | Compute suspends (tidak ada overage charge). Database tetap, insert/update yang menambah storage gagal sampai kuota reset atau upgrade. | Ya, pada siklus berikutnya (CU-hours & egress reset bulanan). Storage tidak reset. |
| Cloudinary Free | Layanan terbatas (transformasi/delivery mungkin dibatasi). Tidak ada hard block dokumentasi yang pasti; monitor credits. | Tergantung jenis limit; verifikasi via dashboard. |

Jangan menyamaratakan: Netlify pause semua proyek; Neon suspend compute (bukan pause site); Cloudinary perilaku spesifik per limit.

## Temuan Kritis::

1. **Vercel Hobby tidak untuk penggunaan komersial.** Fair Use Guidelines Vercel membatasi Hobby untuk penggunaan non-komersial/personal. Ingaustore adalah katalog bisnis (potensi penjualan) → wajib Pro ($20/bulan) atau platform lain. Ini memengaruhi biaya operasional.
2. **Batas body Vercel Function 4.5MB** (FUNCTION_PAYLOAD_TOO_LARGE). Input foto 5MB tidak bisa dikirim via endpoint server. Solusi: client direct-upload ke Vercel Blob (handleUpload token) — sudah diputuskan di API contract.
3. **Neon free tier** cukup untuk MVP (data kecil, traffic rendah) tapi compute suspends jika kuota habis (bukan overage). Untuk produksi dengan traffic tinggi, pertimbangkan Launch.
4. **Vercel Blob Hobby hard limit**: jika terlampaui, Blob diblokir 30 hari (tidak ada overage). Monitor advanced ops (upload).
5. **Prisma**: gunakan hanya ORM. Jangan aktifkan Prisma Data Platform tanpa kebutuhan & persetujuan.

## Alternatif (jika Vercel Pro tidak diinginkan)
- Self-host Next.js di VPS (Node) + Neon free + Vercel Blob (tetap butuh storage) atau S3-compatible (Cloudflare R2, dll.).
- Cloudflare Pages + R2 (R2 free tier: 10GB storage, 1M Class A ops, 10M Class B ops, egress gratis).
- Netlify + Netlify Blobs.

## Keputusan Diperlukan (sebelum Tahap 3)
- Apakah menyetujui Vercel Pro ($20/bulan) untuk deployment produksi, atau pilih alternatif hosting?
- Apakah verifikasi ulang sebelum deployment produksi (disetujui: ya).