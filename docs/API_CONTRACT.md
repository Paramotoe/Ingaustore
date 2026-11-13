# API Contract — Ingaustore

Base URL: `/api`. Semua response JSON. Endpoint admin memerlukan session admin.

## 0. Konvensi

### Response sukses (umum)
```json
{ "success": true, "data": { } }
```
Dengan message opsional: `{ "success": true, "message": "...", "data": { } }`.

### Response error (umum)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nama produk wajib diisi",
    "details": { "name": "Nama produk wajib diisi" }
  }
}
```

### Kode error
| Code | Arti |
|---|---|
| VALIDATION_ERROR | Input tidak valid |
| UNAUTHORIZED | Admin belum login |
| FORBIDDEN | Tidak memiliki akses |
| NOT_FOUND | Resource tidak ditemukan |
| CONFLICT | Konflik (slug/code/kategori dipakai) |
| UPLOAD_ERROR | Gagal upload/validasi foto |
| SERVER_ERROR | Kesalahan server |

### Status code
| Kode | Kapan |
|---|---|
| 200 | Berhasil membaca/mengubah/menghapus |
| 201 | Berhasil dibuat |
| 400 | Input tidak valid |
| 401 | Admin belum login |
| 403 | Tidak memiliki akses |
| 404 | Tidak ditemukan |
| 409 | Konflik |
| 500 | Kesalahan server |

### Pagination
Default `page=1`, `limit=12`. Response:
```json
{ "page": 1, "limit": 12, "total": 35, "totalPages": 3 }
```

### Auth
Session admin via httpOnly cookie (JWT, 8 jam). Endpoint admin: kirim cookie; server verifikasi session + identitas admin.

### Rate limit login
Maksimal 5 percobaan gagal per IP per 15 menit; pesan gagal generik ("Email atau password salah").

---

## 1. Publik

### GET /api/products
Query opsional: `?search=&category=&page=1&limit=12&featured=true&sort=newest`
- `search`: cari nama atau kode (case-insensitive contains).
- `category`: slug kategori.
- `featured`: `true` → hanya produk unggulan.
- `sort`: `newest` (default), `price_asc`, `price_desc`.
Hanya produk `is_active=true`.

Response 200:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Tas Kulit Premium",
      "code": "ING-001",
      "slug": "tas-kulit-premium",
      "priceIdr": 250000,
      "category": { "id": "uuid", "name": "Tas", "slug": "tas" },
      "thumbnail": "https://res.cloudinary.com/.../tas-1.webp",
      "isFeatured": true,
      "isActive": true
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 35, "totalPages": 3 }
}
```
Catatan: `thumbnail` = foto pertama (sort_order terkecil) atau null jika tidak ada foto.

### GET /api/products/:slug
Detail produk aktif. 404 jika tidak ada / nonaktif.
Response 200:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Tas Kulit Premium",
    "code": "ING-001",
    "slug": "tas-kulit-premium",
    "description": "Tas kulit premium...",
    "priceIdr": 250000,
    "category": { "id": "uuid", "name": "Tas", "slug": "tas" },
    "images": [
      {
        "id": "uuid",
        "provider": "cloudinary",
        "assetId": "xxx",
        "publicId": "ingaustore/products/uuid",
        "secureUrl": "https://res.cloudinary.com/.../uuid.webp",
        "width": 1600,
        "height": 1200,
        "bytes": 480000,
        "format": "webp",
        "altText": "Tampilan depan",
        "sortOrder": 1
      }
    ],
    "links": [
      { "id": "uuid", "marketplaceName": "shopee", "url": "https://shopee.co.id/produk" }
    ],
    "isFeatured": true,
    "isActive": true,
    "createdAt": "2026-...",
    "updatedAt": "2026-..."
  }
}
```

### GET /api/categories
Hanya kategori yang memiliki minimal 1 produk aktif.
Response 200:
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Tas", "slug": "tas", "description": "...", "thumbnail": "https://...", "sortOrder": 0, "productCount": 12 }
  ]
}
```

---

## 2. Admin Auth (Auth.js)

### POST /api/admin/login  (Auth.js Credentials endpoint)
Body:
```json
{ "email": "admin@ingaustore.id", "password": "..." }
```
Validasi: email valid, password non-empty.
Response 200: set cookie session (8 jam); `{ "success": true, "message": "Login berhasil", "data": { "email": "..." } }`.
401 jika kredensial salah (pesan generik).

### POST /api/admin/logout
Admin. Response 200: hapus cookie; `{ "success": true, "message": "Logout berhasil" }`.

Catatan: tidak ada endpoint login custom paralel; gunakan alur Auth.js.

---

## 3. Admin Produk

### GET /api/admin/products
Admin. Query: `?search=&category=&page=1&limit=12&sort=newest&active=all|true|false`.
Mengembalikan semua produk (termasuk nonaktif). Response sama seperti GET /api/products
ditambah `isActive`, `isFeatured`, `code`, `description`, `images`, `links`.

### POST /api/admin/products
Admin. Body:
```json
{
  "name": "Tas Kulit Premium",
  "code": "ING-001",
  "description": "Tas kulit premium dengan finishing elegan.",
  "priceIdr": 250000,
  "categoryId": "uuid-kategori",
  "isFeatured": false,
  "isActive": true,
  "images": [
    {
      "provider": "cloudinary",
      "assetId": "xxx",
      "publicId": "ingaustore/products/uuid",
      "secureUrl": "https://res.cloudinary.com/.../uuid.webp",
      "width": 1600,
      "height": 1200,
      "bytes": 480000,
      "format": "webp",
      "altText": "Tampilan depan tas",
      "sortOrder": 1
    }
  ],
  "links": [
    { "marketplaceName": "shopee", "url": "https://shopee.co.id/produk" }
  ]
}
```
Validasi:
- `name`: wajib, 1–255 karakter.
- `code`: opsional; jika diisi 1–50 karakter, unik (case-insensitive trim).
- `priceIdr`: wajib, integer, 1–999.999.999.
- `categoryId`: wajib, UUID valid, kategori harus ada.
- `description`: opsional, max 5000 karakter.
- `isFeatured`, `isActive`: boolean, default false/true.
- `images`: array. Produk aktif wajib minimal 1, maksimal 6. Tiap item: provider=cloudinary, assetId/publicId/secureUrl/width/height/bytes/format wajib; altText opsional max 255; sortOrder integer >= 0 (default index+1).
- `links`: array (boleh kosong). Tiap item: `marketplaceName` wajib, 1–50, lowercase slug; `url` wajib URL valid.
- `slug`: digenerate server dari `name` (slugify lowercase + hyphen). Jika bentrok, tambahkan suffix `-2`, `-3`. Tidak diedit user.

Response 201:
```json
{ "success": true, "message": "Produk berhasil dibuat", "data": { "id": "uuid", "slug": "tas-kulit-premium" } }
```

### PATCH /api/admin/products/:id
Admin. Body partial (semua field opsional, minimal satu field). Jika `images`/`links` dikirim, **mengganti seluruh set** (replace). Aset lama dijadwalkan hapus via file_cleanup_job.
Validasi sama seperti POST untuk field yang dikirim.
Response 200:
```json
{ "success": true, "message": "Produk berhasil diubah", "data": { "id": "uuid", "slug": "tas-kulit-premium" } }
```
404 jika produk tidak ada.

### DELETE /api/admin/products/:id
Admin. Hard delete record + relasi (DB). Aset storage dijadwalkan via file_cleanup_job (status pending) sebelum hapus relasi; retry jika gagal. Kategori tidak dihapus.
Tampilkan dialog konfirmasi (nama produk) di UI.
Response 200: `{ "success": true, "message": "Produk berhasil dihapus" }`.

### PATCH /api/admin/products/:id/status
Admin. Body: `{ "isActive": true|false }`. Alternatif "Nonaktifkan produk".
Response 200.

---

## 4. Admin Kategori

### GET /api/admin/categories
Admin. Daftar semua kategori (+ productCount, termasuk 0).
Response 200:
```json
{ "success": true, "data": [ { "id": "uuid", "name": "Tas", "slug": "tas", "description": "...", "thumbnail": "https://...", "sortOrder": 0, "productCount": 12, "createdAt": "...", "updatedAt": "..." } ] }
```

### POST /api/admin/categories
Admin. Body:
```json
{ "name": "Tas", "description": "Koleksi tas", "thumbnail": "https://...", "thumbnailStorageKey": "...", "sortOrder": 0 }
```
Validasi: name wajib 1–50, unik; slug auto dari name (unik, suffix jika bentrok); description max 160; thumbnail URL valid jika ada.
Response 201.

### PATCH /api/admin/categories/:id
Admin. Partial. Jika thumbnail diganti, aset lama dijadwalkan hapus.
Response 200.

### DELETE /api/admin/categories/:id
Admin. 409 CONFLICT jika masih dipakai produk (pesan: pindahkan produk terlebih dahulu).
Response 200.

### PATCH /api/admin/categories/reorder
Admin. Body: `{ "items": [{ "id": "uuid", "sortOrder": 1 }] }`.

---

## 5. Admin Upload (Cloudinary Signed Upload)

Provider: Cloudinary (Image and Video API). Upload langsung dari browser ke Cloudinary via signed upload.

### POST /api/admin/uploads/signature
Admin. Body:
```json
{ "filename": "tas.jpg", "contentType": "image/jpeg", "size": 1234567 }
```
Validasi policy: size <= 5MB, contentType in {image/jpeg, image/png, image/webp}.
Response 200:
```json
{
  "success": true,
  "data": {
    "cloudName": "xxx",
    "apiKey": "xxx",
    "timestamp": 1700000000,
    "signature": "xxx",
    "folder": "ingaustore/products",
    "publicId": "uuid",
    "eager": "w_1600,c_limit,q_auto,f_webp"
  }
}
```
Signature dibuat server menggunakan `CLOUDINARY_API_SECRET` (hanya server).

### Client upload langsung ke Cloudinary
Client menggunakan signature → upload original (max 5MB) → Cloudinary memproses (WebP, max 1600px sisi terpanjang, no upscale) →
mengembalikan metadata (asset_id, public_id, secure_url, width, height, bytes, format).

### POST /api/admin/uploads/verify
Admin. Body:
```json
{ "assetId": "xxx", "publicId": "ingaustore/products/uuid", "secureUrl": "https://res.cloudinary.com/.../uuid.webp" }
```
Server: verifikasi aset dari Cloudinary (identitas aset, format, ukuran file, dimensi, kepemilikan) →
validasi policy (min 400×400, max 6000px/sisi, max 5MB, format jpeg/png/webp) →
kembalikan metadata siap simpan. Jika gagal validasi, hapus aset di Cloudinary.
Response 201:
```json
{
  "success": true,
  "message": "Foto berhasil diverifikasi",
  "data": {
    "provider": "cloudinary",
    "assetId": "xxx",
    "publicId": "ingaustore/products/uuid",
    "secureUrl": "https://res.cloudinary.com/.../uuid.webp",
    "width": 1600,
    "height": 1200,
    "bytes": 480000,
    "format": "webp",
    "altText": null,
    "sortOrder": 1
  }
}
```

### Alur upload & penghapusan foto
1. Admin pilih file → POST `/api/admin/uploads/signature` → client upload langsung ke Cloudinary.
2. Cloudinary memproses (WebP, max 1600px) → kembalikan metadata.
3. POST `/api/admin/uploads/verify` → server verifikasi aset + validasi policy.
4. Metadata masuk ke `images[]` saat create/update produk.
5. Urutan foto diatur via `sortOrder` (admin reorder).
6. Foto pertama (sortOrder terkecil) = thumbnail (transformasi Cloudinary).
7. Hapus foto dari produk: PATCH produk dengan `images` tanpa item (replace). Aset lama dijadwalkan hapus via file_cleanup_job.
8. Edit produk dibatalkan → foto lama tetap ada; foto baru yang tidak dipakai = orphan, dibersihkan setelah 24 jam.
9. Hapus produk: cascade DB + file_cleanup_job untuk setiap (provider, assetId/publicId).
10. Hapus aset hanya via server berdasarkan identifier tersimpan; jangan terima publicId/URL sembarang dari client.

### Varian gambar (Cloudinary transform)
Gunakan transformasi Cloudinary terbatas: thumbnail (w_200), kartu (w_400), detail (w_1600). Jangan buat transformasi dimensi bebas.

### Cleanup & retry
- Tabel `file_cleanup_job` menyimpan provider, asset_id, public_id, status (pending/done/failed), attempts, last_error.
- Job dibuat sebelum hapus relasi DB (persisten).
- Worker/cron retry job failed (max 5 attempts, backoff). Sediakan cara menjalankan cleanup yang nyata.
- Kegagalan penghapusan aset tidak mengembalikan produk ke katalog.
- Orphan cleanup: foto yang diunggah tapi tidak ditautkan dalam 24 jam dijadwalkan hapus.

---

## 6. Keamanan Endpoint
- Semua `/api/admin/*` wajib session valid (401 jika tidak) + identitas admin.
- Upload wajib admin (401/403).
- Validasi input di server pada setiap endpoint admin, termasuk upload.
- Jangan pernah kirim password/hash/token/secret ke frontend.
- Produk nonaktif: tidak muncul di `GET /api/products` maupun `GET /api/products/:slug` (404).
- Harga/validasi di frontend dan server; input negatif/pecahan ditolak.

---

## 7. Mapping DB ↔ API
| DB | API |
|---|---|
| price_idr | priceIdr |
| product_image.provider | images[].provider |
| product_image.asset_id | images[].assetId |
| product_image.public_id | images[].publicId |
| product_image.secure_url | images[].secureUrl |
| product_image.width | images[].width |
| product_image.height | images[].height |
| product_image.bytes | images[].bytes |
| product_image.format | images[].format |
| product_image.alt_text | images[].altText |
| product_image.sort_order | images[].sortOrder |
| product_image.id | images[].id |
| product_link.marketplace_name | links[].marketplaceName |
| product_link.id | links[].id |
| product.created_at | createdAt |
| product.updated_at | updatedAt |
| (foto pertama) | thumbnail |
| category.description | description |
| category.thumbnail | thumbnail |
| category.sort_order | sortOrder |