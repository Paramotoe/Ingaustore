# ERD — Ingaustore

## 1. Entitas & Relasi (ringkas)
```
admin (1)  --tidak berelasi langsung--  product
category (1) ----< product (N)
product (1) ----< product_image (N)
product (1) ----< product_link (N)
product (1) ----< file_cleanup_job (N)   [opsional, untuk retry hapus file]
```
- Satu produk memiliki satu kategori (wajib).
- Satu produk memiliki banyak foto (1–6 jika aktif) dan link marketplace.
- Tidak ada relasi admin–produk pada MVP.

## 2. Tabel

### admin
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email admin |
| password_hash | VARCHAR(255) | NOT NULL | Password ter-hash (bcrypt) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### category
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Nama kategori |
| slug | VARCHAR(120) | UNIQUE, NOT NULL | URL-friendly |
| description | VARCHAR(160) | NULLABLE | Deskripsi singkat |
| thumbnail_key | TEXT | NULLABLE | Storage key foto kategori |
| sort_order | INTEGER | NOT NULL DEFAULT 0 | Urutan tampil |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### product
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| name | VARCHAR(255) | NOT NULL | Nama produk |
| code | VARCHAR(50) | UNIQUE (partial, WHERE code IS NOT NULL), NULLABLE | Kode produk opsional |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL produk |
| description | TEXT | NULLABLE | Deskripsi produk |
| price_idr | BIGINT | NOT NULL, CHECK >= 1 AND <= 999999999 | Harga Rupiah |
| is_featured | BOOLEAN | NOT NULL DEFAULT false | Produk unggulan |
| is_active | BOOLEAN | NOT NULL DEFAULT true | Tampil di katalog |
| category_id | UUID | FK category(id) ON DELETE RESTRICT, NOT NULL | Relasi ke kategori |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### product_image
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| product_id | UUID | FK product(id) ON DELETE CASCADE, NOT NULL | Relasi ke produk |
| provider | VARCHAR(20) | NOT NULL DEFAULT 'cloudinary' | Provider storage (cloudinary) |
| asset_id | VARCHAR(100) | NOT NULL | Cloudinary asset_id |
| public_id | VARCHAR(255) | NOT NULL | Cloudinary public_id |
| secure_url | TEXT | NOT NULL | URL HTTPS Cloudinary |
| width | INTEGER | NOT NULL | Lebar (px) |
| height | INTEGER | NOT NULL | Tinggi (px) |
| bytes | INTEGER | NOT NULL | Ukuran file (bytes) |
| format | VARCHAR(20) | NOT NULL | Format (jpg/png/webp) |
| alt_text | VARCHAR(255) | NULLABLE | Teks alternatif |
| sort_order | INTEGER | NOT NULL DEFAULT 0 | Urutan foto di slider |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### product_link
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| product_id | UUID | FK product(id) ON DELETE CASCADE, NOT NULL | Relasi ke produk |
| marketplace_name | VARCHAR(50) | NOT NULL | Mis. shopee, tokopedia, whatsapp |
| url | TEXT | NOT NULL | Link marketplace |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### file_cleanup_job
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| storage_key | TEXT | NOT NULL | Key file di storage |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending' | pending / done / failed |
| attempts | INTEGER | NOT NULL DEFAULT 0 | Jumlah percobaan |
| last_error | TEXT | NULLABLE | Error terakhir |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

## 3. Index
- `admin.email` UNIQUE
- `category.name` UNIQUE
- `category.slug` UNIQUE
- `category.sort_order`
- `product.slug` UNIQUE
- `product.code` UNIQUE (partial, WHERE code IS NOT NULL)
- `product.category_id`
- `product.is_active`
- `product.is_featured`
- `product.created_at` DESC
- `product_image.(product_id, sort_order)`
- `product_link.product_id`
- `file_cleanup_job.status`

## 4. Aturan Integritas
- Hapus produk → cascade hapus foto & link (DB); file storage dijadwalkan via file_cleanup_job.
- Hapus kategori yang masih dipakai produk → ditolak (409 CONFLICT) (ON DELETE RESTRICT).
- `code` unik jika diisi.
- `slug` tidak berubah otomatis saat nama diedit.
- `price_idr` rentang 1–999.999.999.
- `product_image.sort_order` menentukan urutan slider (naik).
- Foto pertama (sort_order terkecil) = thumbnail.
- `is_active=false` → produk tidak muncul di endpoint publik (list & detail).
- Produk aktif wajib minimal 1 foto; nonaktif boleh 0 foto.
- Maksimal 6 foto per produk.
- Kategori kosong tampil di dashboard, disembunyikan dari navigasi publik.

## 5. Catatan Evolusi
- Tabel `admin` tunggal pada MVP; tidak ada role/permission.
- `marketplace_name` disimpan sebagai string; validasi nilai di application layer.
- `file_cleanup_job` mendukung retry penghapusan file storage.
- Soft delete tidak dipakai; hard delete dengan cleanup job.