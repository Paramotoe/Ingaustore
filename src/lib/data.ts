import { prisma } from "./prisma";
import * as mock from "./mock-data";
import type { Product, Category, Paginated } from "./types";

// Mode data eksplisit.
// - DATA_MODE=mock      → gunakan mock (hanya demo/dev yang disengaja)
// - DATA_MODE=database  → gunakan database (PoC/produksi). Kegagalan = error terkontrol.
// Jika DATA_MODE tidak diset: mock jika DATABASE_URL tidak ada/kosong/placeholder, database jika ada.
const rawMode = (process.env.DATA_MODE ?? "").toLowerCase().trim();
const placeholderDb = "postgresql://user:pass@localhost:5432/ingaustore?sslmode=require";
const hasRealDb = !!process.env.DATABASE_URL && process.env.DATABASE_URL !== placeholderDb;

let dataMode: "mock" | "database";
if (rawMode === "mock" || rawMode === "database") {
  dataMode = rawMode;
} else if (rawMode === "") {
  dataMode = hasRealDb ? "database" : "mock";
} else {
  throw new Error(`Konfigurasi tidak valid: DATA_MODE="${rawMode}". Gunakan "mock" atau "database".`);
}

if (dataMode === "database" && !hasRealDb) {
  throw new Error("Konfigurasi tidak valid: DATA_MODE=database tetapi DATABASE_URL tidak tersedia atau masih placeholder. Isi DATABASE_URL yang valid.");
}

const useDb = dataMode === "database";

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!useDb) return mock.getCategoryBySlug(slug);
  const c = await prisma.category.findUnique({ where: { slug } });
  if (!c) return null;
  return { id: c.id, name: c.name, slug: c.slug, description: c.description, thumbnail: c.thumbnail, sortOrder: c.sortOrder };
}

export async function getCategories(): Promise<Category[]> {
  if (!useDb) return mock.getCategories();
  const cats = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  return cats
    .filter((c) => c._count.products > 0)
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, thumbnail: c.thumbnail, sortOrder: c.sortOrder }));
}

export async function getProducts(params: {
  search?: string;
  category?: string;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
  active?: "all" | "true" | "false";
}): Promise<Paginated<Product>> {
  if (!useDb) {
    const r = mock.getProducts(params as Parameters<typeof mock.getProducts>[0]);
    return { data: r.data, pagination: r.pagination };
  }
  const {
    search = "", category = "", featured, sort = "newest", page = 1, limit = 12, active = "true",
  } = params;
  const where: Record<string, unknown> = {};
  if (active === "true") where.isActive = true;
  else if (active === "false") where.isActive = false;
  if (featured) where.isFeatured = true;
  if (category) where.category = { slug: category };
  if (search.trim()) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }
  const orderBy =
    sort === "price_asc" ? { priceIdr: "asc" as const } :
    sort === "price_desc" ? { priceIdr: "desc" as const } :
    { createdAt: "desc" as const };

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where, orderBy, skip: (page - 1) * limit, take: limit,
      include: { category: true, images: { orderBy: { sortOrder: "asc" } }, links: true },
    }),
  ]);

  const data: Product[] = rows.map((p) => ({
    id: p.id, name: p.name, code: p.code, slug: p.slug, description: p.description,
    priceIdr: Number(p.priceIdr), isFeatured: p.isFeatured, isActive: p.isActive,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug, description: p.category.description, thumbnail: p.category.thumbnail, sortOrder: p.category.sortOrder },
    images: p.images.map((i) => ({ id: i.id, url: i.secureUrl, altText: i.altText, sortOrder: i.sortOrder })),
    links: p.links.map((l) => ({ id: l.id, marketplaceName: l.marketplaceName, url: l.url })),
    createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
  }));

  return { data, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!useDb) return mock.getProductBySlug(slug);
  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, links: true },
  });
  if (!p || !p.isActive) return null;
  return {
    id: p.id, name: p.name, code: p.code, slug: p.slug, description: p.description,
    priceIdr: Number(p.priceIdr), isFeatured: p.isFeatured, isActive: p.isActive,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug, description: p.category.description, thumbnail: p.category.thumbnail, sortOrder: p.category.sortOrder },
    images: p.images.map((i) => ({ id: i.id, url: i.secureUrl, altText: i.altText, sortOrder: i.sortOrder })),
    links: p.links.map((l) => ({ id: l.id, marketplaceName: l.marketplaceName, url: l.url })),
    createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
  };
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!useDb) return mock.getRelatedProducts(product, limit);
  const rows = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.category.id, NOT: { id: product.id } },
    take: limit,
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, links: true },
  });
  return rows.map((p) => ({
    id: p.id, name: p.name, code: p.code, slug: p.slug, description: p.description,
    priceIdr: Number(p.priceIdr), isFeatured: p.isFeatured, isActive: p.isActive,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug, description: p.category.description, thumbnail: p.category.thumbnail, sortOrder: p.category.sortOrder },
    images: p.images.map((i) => ({ id: i.id, url: i.secureUrl, altText: i.altText, sortOrder: i.sortOrder })),
    links: p.links.map((l) => ({ id: l.id, marketplaceName: l.marketplaceName, url: l.url })),
    createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
  }));
}

export const featuredProducts = async (): Promise<Product[]> => {
  if (!useDb) return mock.featuredProducts;
  const r = await getProducts({ featured: true, limit: 20, active: "true" });
  return r.data;
};