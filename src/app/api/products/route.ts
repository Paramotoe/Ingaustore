import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search") ?? url.searchParams.get("q") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const featured = url.searchParams.get("featured");
  const sort = url.searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "12") || 12));

  const where: any = { isActive: true };
  if (featured === "true") where.isFeatured = true;
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
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const data = rows.map((p) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    slug: p.slug,
    priceIdr: Number(p.priceIdr),
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
    thumbnail: p.images[0]?.secureUrl ?? null,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
  }));

  return NextResponse.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}