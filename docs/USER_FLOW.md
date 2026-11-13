# User Flow — Ingaustore

## 1. Pengunjung (tanpa login)

### 1.1 Jelajah katalog
1. Buka `/`.
2. Header: logo, pencarian, navigasi, tombol tema.
3. Hero: eyebrow, headline, supporting text, CTA.
4. Category strip: pilih kategori → URL filter `?category=slug`, katalog ter-update. Kategori kosong disembunyikan dari navigasi publik.
5. Koleksi pilihan: klik kartu → filter kategori.
6. Produk unggulan (jika ada).
7. Semua produk: search nama/kode, filter kategori, sort, pagination.
8. Klik kartu produk → `/produk/[slug]`.

### 1.2 Detail produk
1. Breadcrumb: Beranda > Kategori > Nama Produk.
2. Galeri foto (slider jika >1 foto), thumbnail, lightbox.
3. Informasi: nama, harga, kategori, kode (jika ada), deskripsi (jika ada).
4. Section "Tersedia di": tombol marketplace (jika ada link).
5. Keterangan: pembelian di platform eksternal.
6. Produk terkait (kategori sama, kecuali produk ini).

### 1.3 Pencarian & kategori
- `/cari?q=` menampilkan hasil pencarian.
- `/kategori/[slug]` menampilkan produk kategori tersebut.

### 1.4 State wajib
- Loading skeleton.
- Hasil kosong.
- Kategori tanpa produk.
- Error + tombol coba lagi.
- Gambar gagal dimuat (placeholder).
- Produk tidak tersedia (404).
- Produk tanpa link marketplace (sembunyikan tombol).
- Deskripsi/kode kosong (tanpa ruang kosong).

---

## 2. Admin

### 2.1 Login (Auth.js)
1. Buka `/admin/login`.
2. Input email & password.
3. Submit → Auth.js Credentials.
4. Sukses → redirect `/admin/products`. Gagal → pesan generik "Email atau password salah".
5. Rate limit: max 5 gagal/IP/15 menit.

### 2.2 Kelola produk
1. Dashboard `/admin/products`: daftar semua produk (termasuk nonaktif), search/filter/sort/pagination.
2. Tambah: `/admin/products/new` → form → upload foto (opsional, min 1 jika aktif) → submit POST.
3. Edit: `/admin/products/[id]` → form terisi → submit PATCH (foto lama dijadwalkan hapus).
4. Nonaktifkan: toggle `isActive` (alternatif hapus).
5. Hapus: dialog konfirmasi (nama produk) → DELETE → refresh daftar.
6. Slug tampil read-only + tombol salin link.

### 2.3 Kelola kategori
1. Daftar kategori (termasuk kosong) dengan productCount.
2. Tambah/edit (nama, deskripsi, thumbnail, sortOrder).
3. Hapus: ditolak jika masih dipakai produk (pesan pindahkan produk).
4. Reorder kategori.
5. Kategori kosong tampil di dashboard, disembunyikan dari navigasi publik.

### 2.4 Upload foto
1. Pilih file → request token → client upload original langsung ke Blob.
2. POST `/api/admin/uploads/process` → server validasi + proses WebP.
3. URL hasil masuk ke `images[]` dengan sortOrder.
4. Reorder foto (admin).
5. Hapus foto: PATCH produk tanpa item (file lama dijadwalkan hapus).

### 2.5 Logout
1. Tombol logout → POST `/api/admin/logout` → redirect `/admin/login`.

---

## 3. Tema
1. Kunjungan pertama: gunakan preferensi sistem (light → aurora-light, dark → midnight-neon).
2. Setelah pilih tema: simpan di localStorage, prioritaskan.
3. Terapkan sebelum paint pertama (inline script) untuk cegah flash.
4. Tidak baca localStorage saat SSR.
5. Atur `color-scheme` sesuai jenis tema.
6. ThemeSwitcher: nama tema + preview swatch.

---

## 4. Navigasi & Interaksi
- Semua kontrol keyboard-accessible.
- Focus indicator terlihat di semua tema.
- Hover transition 160–220ms.
- Animasi masuk ringan (opacity + translate).
- Hormati `prefers-reduced-motion`.
- Target sentuh minimal 44x44px.
- Tidak ada horizontal overflow pada mobile.