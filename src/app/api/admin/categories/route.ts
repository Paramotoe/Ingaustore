import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(160).optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  thumbnailStorageKey: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

async function uniqueSlug(base: string) {
  let slug = base || "kategori";
  let i = 2;
  while (await prisma.category.findUnique({ where: { slug } })) slug = `${base}-${i++}`;
  return slug;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });
  const cats = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({
    success: true,
    data: cats.map((c) => ({
      id: c.id, name: c.name, slug: c.slug, description: c.description, thumbnail: c.thumbnail,
      sortOrder: c.sortOrder, productCount: c._count.products, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });
  let body: unknown; try { body = await req.json(); } catch { body = null; }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const details: Record<string, string> = {};
    for (const issue of parsed.error.issues) details[issue.path.join(".") || "root"] = issue.message;
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Input tidak valid", details } }, { status: 400 });
  }
  const d = parsed.data;
  const exists = await prisma.category.findUnique({ where: { name: d.name } });
  if (exists) return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "Nama kategori sudah digunakan" } }, { status: 409 });
  const slug = await uniqueSlug(slugify(d.name));
  const cat = await prisma.category.create({
    data: { name: d.name, slug, description: d.description ?? null, thumbnail: d.thumbnail ?? null, sortOrder: d.sortOrder ?? 0 },
  });
  return NextResponse.json({ success: true, message: "Kategori berhasil dibuat", data: { id: cat.id, slug: cat.slug } }, { status: 201 });
}