import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

const imageSchema = z.object({
  provider: z.literal("cloudinary"),
  assetId: z.string().min(1),
  publicId: z.string().min(1),
  secureUrl: z.string().url(),
  width: z.number().int().min(400).max(6000),
  height: z.number().int().min(400).max(6000),
  bytes: z.number().int().min(1).max(5 * 1024 * 1024),
  format: z.enum(["jpg", "jpeg", "png", "webp"]),
  altText: z.string().max(255).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

const linkSchema = z.object({
  marketplaceName: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  url: z.string().url(),
});

const createSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  priceIdr: z.number().int().min(1).max(999999999),
  categoryId: z.string().uuid(),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  images: z.array(imageSchema).max(6).default([]),
  links: z.array(linkSchema).default([]),
});

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

async function uniqueSlug(base: string) {
  let slug = base || "produk";
  let i = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const active = url.searchParams.get("active") ?? "all";
  const sort = url.searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "12") || 12));

  const where: any = {};
  if (active === "true") where.isActive = true;
  else if (active === "false") where.isActive = false;
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
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true, images: { orderBy: { sortOrder: "asc" } }, links: true },
    }),
  ]);

  const data = rows.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    slug: p.slug,
    description: p.description,
    priceIdr: Number(p.priceIdr),
    categoryId: p.categoryId,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    images: p.images.map((i) => ({
      id: i.id,
      provider: i.provider,
      assetId: i.assetId,
      publicId: i.publicId,
      secureUrl: i.secureUrl,
      width: i.width,
      height: i.height,
      bytes: i.bytes,
      format: i.format,
      altText: i.altText,
      sortOrder: i.sortOrder,
    })),
    links: p.links.map((l) => ({ id: l.id, marketplaceName: l.marketplaceName, url: l.url })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { body = null; }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const details: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      details[issue.path.join(".") || "root"] = issue.message;
    }
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Input tidak valid", details } }, { status: 400 });
  }
  const d = parsed.data;

  // validate category exists
  const cat = await prisma.category.findUnique({ where: { id: d.categoryId } });
  if (!cat) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Kategori tidak ditemukan", details: { categoryId: "Kategori tidak ditemukan" } } }, { status: 400 });

  // code uniqueness
  if (d.code) {
    const code = d.code.trim();
    const exists = await prisma.product.findUnique({ where: { code } });
    if (exists) return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "Kode produk sudah digunakan" } }, { status: 409 });
    d.code = code;
  } else {
    d.code = null;
  }

  // active product requires >=1 image
  if (d.isActive && d.images.length === 0) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Produk aktif wajib memiliki minimal 1 foto", details: { images: "Minimal 1 foto" } } }, { status: 400 });
  }
  if (d.images.length > 6) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Maksimal 6 foto per produk" } }, { status: 400 });
  }

  const slug = await uniqueSlug(slugify(d.name));

  const product = await prisma.product.create({
    data: {
      name: d.name,
      code: d.code,
      slug,
      description: d.description ?? null,
      priceIdr: BigInt(d.priceIdr),
      isFeatured: d.isFeatured,
      isActive: d.isActive,
      categoryId: d.categoryId,
      images: {
        create: d.images.map((img, idx) => ({
          provider: img.provider,
          assetId: img.assetId,
          publicId: img.publicId,
          secureUrl: img.secureUrl,
          width: img.width,
          height: img.height,
          bytes: img.bytes,
          format: img.format,
          altText: img.altText ?? null,
          sortOrder: img.sortOrder ?? idx + 1,
        })),
      },
      links: {
        create: d.links.map((l) => ({ marketplaceName: l.marketplaceName, url: l.url })),
      },
    },
  });

  return NextResponse.json({ success: true, message: "Produk berhasil dibuat", data: { id: product.id, slug: product.slug } }, { status: 201 });
}