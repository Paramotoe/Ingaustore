import type { Product, Category } from "./types";

export const categories: Category[] = [
  { id: "cat-1", name: "Fashion", slug: "fashion", description: "Pilihan fashion premium", thumbnail: null, sortOrder: 1 },
  { id: "cat-2", name: "Elektronik", slug: "elektronik", description: "Gadget dan aksesori", thumbnail: null, sortOrder: 2 },
  { id: "cat-3", name: "Beauty", slug: "beauty", description: "Perawatan dan kecantikan", thumbnail: null, sortOrder: 3 },
  { id: "cat-4", name: "Home", slug: "home", description: "Kenyamanan rumah", thumbnail: null, sortOrder: 4 },
  { id: "cat-5", name: "Lifestyle", slug: "lifestyle", description: "Gaya hidup sehari-hari", thumbnail: null, sortOrder: 5 },
];

const img = (seed: string, w = 600, h = 750) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const now = "2026-01-01T00:00:00.000Z";

export const products: Product[] = [
  {
    id: "p-1", name: "Tas Kulit Premium", code: "ING-001", slug: "tas-kulit-premium",
    description: "Tas kulit premium dengan finishing elegan, cocok untuk aktivitas harian maupun acara formal.",
    priceIdr: 250000, isFeatured: true, isActive: true,
    category: categories[0],
    images: [
      { id: "i-1a", url: img("tas1"), altText: "Tampilan depan tas", sortOrder: 1 },
      { id: "i-1b", url: img("tas2"), altText: "Tampilan samping", sortOrder: 2 },
    ],
    links: [{ id: "l-1", marketplaceName: "shopee", url: "https://shopee.co.id" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-2", name: "Jam Tangan Minimalis", code: "ING-002", slug: "jam-tangan-minimalis",
    description: "Jam tangan dengan desain minimalis dan tali kulit yang nyaman.",
    priceIdr: 450000, isFeatured: true, isActive: true,
    category: categories[1],
    images: [{ id: "i-2", url: img("jam1"), altText: "Jam tangan", sortOrder: 1 }],
    links: [{ id: "l-2", marketplaceName: "tokopedia", url: "https://tokopedia.com" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-3", name: "Serum Wajah Glow", code: "ING-003", slug: "serum-wajah-glow",
    description: null,
    priceIdr: 185000, isFeatured: false, isActive: true,
    category: categories[2],
    images: [{ id: "i-3", url: img("serum1"), altText: "Serum wajah", sortOrder: 1 }],
    links: [{ id: "l-3", marketplaceName: "shopee", url: "https://shopee.co.id" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-4", name: "Lampu Meja Ambient", code: null, slug: "lampu-meja-ambient",
    description: "Lampu meja dengan cahaya hangat untuk suasana rumah yang nyaman.",
    priceIdr: 320000, isFeatured: true, isActive: true,
    category: categories[3],
    images: [
      { id: "i-4a", url: img("lampu1"), altText: "Lampu meja", sortOrder: 1 },
      { id: "i-4b", url: img("lampu2"), altText: "Detail lampu", sortOrder: 2 },
      { id: "i-4c", url: img("lampu3"), altText: "Lampu menyala", sortOrder: 3 },
    ],
    links: [{ id: "l-4", marketplaceName: "whatsapp", url: "https://wa.me/6281234567890" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-5", name: "Kacamata Sunglasses", code: "ING-005", slug: "kacamata-sunglasses",
    description: "Kacamata hitam dengan frame ringan dan lensa UV protection.",
    priceIdr: 175000, isFeatured: false, isActive: true,
    category: categories[0],
    images: [{ id: "i-5", url: img("kacamata1"), altText: "Kacamata", sortOrder: 1 }],
    links: [{ id: "l-5", marketplaceName: "tokopedia", url: "https://tokopedia.com" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-6", name: "Earbuds Wireless", code: "ING-006", slug: "earbuds-wireless",
    description: "Earbuds nirkabel dengan kualitas suara jernih dan baterai tahan lama.",
    priceIdr: 299000, isFeatured: false, isActive: true,
    category: categories[1],
    images: [{ id: "i-6", url: img("earbuds1"), altText: "Earbuds", sortOrder: 1 }],
    links: [
      { id: "l-6a", marketplaceName: "shopee", url: "https://shopee.co.id" },
      { id: "l-6b", marketplaceName: "tokopedia", url: "https://tokopedia.com" },
    ],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-7", name: "Lipstik Matte", code: "ING-007", slug: "lipstik-matte",
    description: null,
    priceIdr: 95000, isFeatured: false, isActive: true,
    category: categories[2],
    images: [{ id: "i-7", url: img("lipstik1"), altText: "Lipstik", sortOrder: 1 }],
    links: [{ id: "l-7", marketplaceName: "shopee", url: "https://shopee.co.id" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-8", name: "Vas Bunga Keramik", code: null, slug: "vas-bunga-keramik",
    description: "Vas keramik handmade dengan tekstur alami.",
    priceIdr: 145000, isFeatured: false, isActive: true,
    category: categories[3],
    images: [{ id: "i-8", url: img("vas1"), altText: "Vas bunga", sortOrder: 1 }],
    links: [],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-9", name: "Botol Minum Termos", code: "ING-009", slug: "botol-minum-termos",
    description: "Botol termos stainless steel, menjaga suhu hingga 12 jam.",
    priceIdr: 210000, isFeatured: true, isActive: true,
    category: categories[4],
    images: [{ id: "i-9", url: img("botol1"), altText: "Botol termos", sortOrder: 1 }],
    links: [{ id: "l-9", marketplaceName: "tokopedia", url: "https://tokopedia.com" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-10", name: "Dompet Kulit", code: "ING-010", slug: "dompet-kulit",
    description: "Dompet kulit tipis dengan slot kartu yang cukup.",
    priceIdr: 135000, isFeatured: false, isActive: true,
    category: categories[0],
    images: [{ id: "i-10", url: img("dompet1"), altText: "Dompet", sortOrder: 1 }],
    links: [{ id: "l-10", marketplaceName: "shopee", url: "https://shopee.co.id" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-11", name: "Diffuser Aromaterapi", code: "ING-011", slug: "diffuser-aromaterapi",
    description: "Diffuser dengan lampu LED dan timer otomatis.",
    priceIdr: 275000, isFeatured: false, isActive: true,
    category: categories[3],
    images: [{ id: "i-11", url: img("diffuser1"), altText: "Diffuser", sortOrder: 1 }],
    links: [{ id: "l-11", marketplaceName: "shopee", url: "https://shopee.co.id" }],
    createdAt: now, updatedAt: now,
  },
  {
    id: "p-12", name: "Tote Bag Canvas", code: "ING-012", slug: "tote-bag-canvas",
    description: "Tote bag canvas tebal dengan desain minimalis.",
    priceIdr: 89000, isFeatured: false, isActive: false,
    category: categories[4],
    images: [],
    links: [],
    createdAt: now, updatedAt: now,
  },
];

export const featuredProducts = products.filter((p) => p.isFeatured && p.isActive);

// Simulated data-access layer (replace with API calls later)
export function getProducts(params: {
  search?: string;
  category?: string;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
  active?: "all" | "true" | "false";
}) {
  const {
    search = "",
    category = "",
    featured,
    sort = "newest",
    page = 1,
    limit = 12,
    active = "true",
  } = params;

  let list = [...products];
  if (active === "true") list = list.filter((p) => p.isActive);
  else if (active === "false") list = list.filter((p) => !p.isActive);

  if (featured) list = list.filter((p) => p.isFeatured);
  if (category) list = list.filter((p) => p.category.slug === category);
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.code ?? "").toLowerCase().includes(q)
    );
  }

  if (sort === "price_asc") list.sort((a, b) => a.priceIdr - b.priceIdr);
  else if (sort === "price_desc") list.sort((a, b) => b.priceIdr - a.priceIdr);
  else list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);

  return { data, pagination: { page, limit, total, totalPages } };
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug && p.isActive) ?? null;
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id) ?? null;
}

export function getCategories() {
  return categories;
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug) ?? null;
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter((p) => p.isActive && p.category.slug === product.category.slug && p.id !== product.id)
    .slice(0, limit);
}