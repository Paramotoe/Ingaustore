# PRD — Ingaustore.id

## 1. Ringkasan Produk
Ingaustore adalah web application **katalog produk** yang menampilkan koleksi barang
secara elegan, modern, dan mewah. Pengunjung dapat melihat produk, membuka detail,
melihat foto dalam slider, serta mengakses link pembelian di marketplace.

Bukan marketplace transaksi: tidak ada keranjang, checkout, atau pembayaran.
Pengunjung tidak perlu login. Hanya admin yang login untuk mengelola katalog.

## 2. Tujuan
1. Menampilkan produk dengan tampilan premium dan mudah dibaca.
2. Memudahkan admin menambah, mengubah, dan menghapus produk.
3. Mengarahkan calon pembeli ke marketplace atau kanal penjualan.
4. Berjalan tanpa registrasi/login untuk pengunjung.

## 3. Persona
| Persona | Kebutuhan |
|---|---|
| Pengunjung / calon pembeli | Melihat katalog, mencari produk, melihat foto dan harga, lalu membuka link marketplace |
| Admin toko | Menambahkan produk baru, mengubah harga/foto, mengatur kategori, menghapus produk |
| Pemilik Ingaustore | Memantau produk yang tampil dan menjaga katalog tetap update |

## 4. User Stories
- Sebagai pengunjung, saya ingin melihat daftar produk dalam tampilan katalog menarik.
- Sebagai pengunjung, saya ingin membuka detail produk (nama, harga, foto, kategori, link pembelian).
- Sebagai pengunjung, saya ingin melihat beberapa foto produk dalam slider.
- Sebagai pengunjung, saya ingin memfilter produk berdasarkan kategori dan mencari berdasarkan nama.
- Sebagai admin, saya ingin login dengan aman.
- Sebagai admin, saya ingin menambahkan produk beserta beberapa foto dan link marketplace.
- Sebagai admin, saya ingin mengedit atau menghapus produk.

## 5. Acceptance Criteria (MVP)
1. Pengunjung dapat melihat produk tanpa login.
2. Klik produk membuka halaman detail: nama, harga, kategori, foto, link marketplace.
3. Produk dengan lebih dari satu foto memiliki slider yang dapat digeser.
4. Admin dapat membuat produk dengan nama, kode opsional, harga Rupiah, kategori, foto, link.
5. Produk tanpa foto tetap dapat disimpan (jika nonaktif), menampilkan placeholder elegan.
6. Harga ditampilkan format Rupiah tanpa desimal, mis. `Rp250.000`.
7. Hanya admin yang dapat mengakses dashboard dan mengubah data.
8. Produk nonaktif tidak muncul di endpoint publik (termasuk detail).
9. Kategori yang masih digunakan produk tidak boleh langsung dihapus.
10. Produk aktif wajib memiliki minimal 1 foto; maksimal 6 foto.
11. Harga integer Rupiah, rentang 1–999.999.999; tidak boleh 0/negatif/pecahan.
12. Setiap produk wajib memiliki tepat satu kategori.
13. Kode produk opsional; jika diisi unik (case-insensitive, trim).
14. Slug auto-generate saat pertama simpan; tidak berubah saat nama diedit.
15. Upload foto: max 5MB/file, JPEG/PNG/WebP, min 400×400, max 6000px/sisi; hasil WebP max 1600px sisi terpanjang.
16. Session admin 8 jam; rate limit login; pesan gagal generik.
17. Kategori kosong tampil di dashboard, disembunyikan dari navigasi publik.

## 6. Batasan MVP
### Termasuk
- Katalog dan detail produk.
- Pencarian nama/kode.
- Filter kategori.
- Sort terbaru/harga.
- Pagination.
- Produk unggulan.
- Galeri multi-foto.
- Link marketplace.
- Admin CRUD produk dan kategori.
- Upload, urutkan, hapus foto.
- Empat tema sesuai prompt UI.
- Nonaktifkan produk (alternatif hapus).

### Tidak termasuk
- Keranjang, checkout, pembayaran.
- Akun pengunjung.
- Wishlist.
- Rating dan ulasan.
- Diskon dan flash sale.
- Pengelolaan stok.
- Newsletter.
- Redirect slug lama (ditunda).

## 7. Keputusan Final
1. Stack: Next.js App Router + React + TypeScript + Tailwind CSS.
2. Database: Neon PostgreSQL + Prisma (verifikasi free tier sebelum lock).
3. Penyimpanan foto: Vercel Blob (verifikasi free tier).
4. Deployment: Vercel.
5. Satu admin, tanpa registrasi publik, tanpa multi-admin.
6. Tidak perlu relasi admin–produk.
7. Satu produk memiliki satu kategori (wajib).
8. Satu produk dapat memiliki banyak foto (1–6) dan link marketplace.
9. Kode produk opsional; jika diisi unik.
10. Harga integer Rupiah, rentang 1–999.999.999.
11. Produk nonaktif tidak muncul di endpoint publik, termasuk detail.
12. Kategori yang masih digunakan produk tidak boleh langsung dihapus.
13. Slug unik, tidak berubah otomatis saat nama diedit.
14. Auth admin: **Auth.js (NextAuth) v5, Credentials provider, bcrypt, JWT session strategy,
    httpOnly/Secure (prod)/SameSite=Lax cookie, middleware proteksi, session 8 jam,
    rate limit login, pesan gagal generik.** Hanya satu mekanisme session.
15. Upload arsitektur: client direct-upload ke Vercel Blob (handleUpload token dari server)
    untuk mendukung 5MB; server fetch original → validasi dimensi/konten → proses WebP →
    re-upload → hapus original → kembalikan URL hasil. Validasi berlapis (OWASP-style).
16. Penghapusan file: persistent cleanup job table sebelum hapus relasi; retry pada gagal;
    jangan revert produk; hapus hanya file milik aplikasi by storage key.
17. Foto lama dijadwalkan hapus setelah edit berhasil; orphan dibersihkan setelah 24 jam.
18. Kategori: name max 50 unik, slug auto unik, description max 160 opsional,
    thumbnailKey opsional, sortOrder integer default 0.
19. Harga field API: `priceIdr`.

## 8. Asumsi
- Hosting: Netlify Free ($0, 300 credits/bulan, hard limit, penggunaan komersial diizinkan). Upgrade hanya dengan persetujuan.
- Database: Neon PostgreSQL Free + Prisma ORM. Gunakan pooled connection untuk runtime; migration connection sesuai dokumentasi. Jangan aktifkan Prisma Accelerate/Postgres atau layanan tambahan berbayar.
- Penyimpanan foto: Cloudinary Free (Image and Video API, bukan Assets DAM). Signed upload, server verify aset, metadata di DB. Jangan gunakan unrestricted unsigned upload.
- Admin tunggal di-seed via script membaca env (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`).
- Password produksi diberikan terpisah via env; hash disimpan di DB.
- Upload foto: batas efektif 4.5MB pada Netlify Function (binary base64). Input 5MB → gunakan direct upload atau turunkan batas ke 4MB.
- Kategori "Semua" adalah filter UI, bukan entitas DB.
- Koleksi (Tech Essentials, dll.) adalah shortcut filter kategori, bukan entitas baru.
- Marketplace yang didukung: shopee, tokopedia, whatsapp, lazada, instagram, facebook, website.
- Harga ditampilkan `Rp` + pemisah ribuan titik, tanpa desimal, tanpa spasi.
- Kategori kosong tampil di dashboard, disembunyikan dari navigasi publik.

## 9. Pertanyaan Terbuka (terbatas)
1. Verifikasi batas paket gratis & potensi biaya Neon/Prisma/Vercel Blob/Vercel sebelum lock.
2. Apakah admin boleh mengubah slug secara manual di versi berikutnya (redirect URL lama).

## 10. Struktur Halaman
| Halaman | Route | Akses |
|---|---|---|
| Homepage / katalog | `/` | Publik |
| Detail produk | `/produk/[slug]` | Publik |
| Kategori | `/kategori/[slug]` | Publik |
| Pencarian | `/cari?q=` | Publik |
| Login admin | `/admin/login` | Publik |
| Dashboard produk | `/admin/products` | Admin |
| Tambah produk | `/admin/products/new` | Admin |
| Edit produk | `/admin/products/[id]` | Admin |
| Kelola kategori | `/admin/categories` | Admin |

## 11. Design System (ringkas)
Semantic color tokens: `--background`, `--surface`, `--surface-elevated`,
`--foreground`, `--muted-foreground`, `--border`, `--primary`, `--on-primary`,
`--accent`, `--focus-ring`.

Empat tema via `data-theme` pada `<html>`: `aurora-light`, `ivory-luxe`,
`midnight-neon`, `obsidian-gold`. Satu implementasi komponen, empat set token.

Border radius: input/tombol 12–14px, kartu produk 18–22px, panel/hero 24–32px.
Container max ~1280px. Font sans modern (Geist).

## 12. Rencana Implementasi
### Tahap 1 — Normalisasi spesifikasi (SEKARANG)
- Audit konflik & kekurangan dokumen. ✓
- Buat `docs/PRD.md`, `docs/ERD.md`, `docs/API_CONTRACT.md`, `docs/USER_FLOW.md`. ✓
- Lengkapi request/response, validasi, akses, error setiap endpoint. ✓
- Dokumentasikan alur upload & penghapusan foto. ✓
- Pisahkan keputusan final, asumsi, pertanyaan terbuka. ✓
- **Tunjukkan rencana untuk disetujui. Jangan tulis kode aplikasi sebelum disetujui.**

### Tahap 2 — Frontend
- Katalog & detail produk dengan mock data.
- Terapkan 4 tema.
- Pastikan navigasi & interaksi UI berfungsi.

### Tahap 3 — Backend & Admin
- Database, auth, CRUD, upload.
- Hubungkan frontend dengan API.
- Hilangkan ketergantungan mock data di mode produksi.

### Tahap 4 — Pengujian & Deployment
- Uji akses publik vs admin, input invalid, produk nonaktif, upload gagal.
- Uji tampilan mobile, keyboard, semua tema.
- Dokumentasikan env vars & langkah deployment.

## 13. Audit Konflik & Kekurangan (ringkas)
1. ERD asli tidak dilampirkan (hanya header "ERD"); ERD direkonstruksi dari data dictionary.
2. Nama tabel `product_image`/`product_link` tidak eksplisit di data dictionary; disepakati.
3. API memakai `price`/`thumbnail`/`altText`/`sortOrder`, DB memakai `price_idr`/`url`/`alt_text`/`sort_order`; mapping didokumentasikan di API_CONTRACT; API konsisten `priceIdr`.
4. Auth admin: dipilih Auth.js v5 (perlu versi kompatibel dikunci).
5. "Koleksi" & "kategori strip" adalah UI shortcut, bukan entitas DB.
6. Format harga: tanpa spasi (`Rp250.000`).
7. Upload 5MB melebihi batas Vercel serverless (~4.5MB): gunakan client direct-upload + server processing.
8. Kategori kini memiliki thumbnail & description.

---
*Status: Tahap 1 — menunggu persetujuan sebelum implementasi kode.*