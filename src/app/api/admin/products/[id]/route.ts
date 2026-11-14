import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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

const httpUrl = z.string().url().refine((u) => {
  try { const p = new URL(u); return p.protocol === "https:" || p.protocol === "http:"; } catch { return false; }
}, "URL harus http/https");
const linkSchema = z.object({
  marketplaceName: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  url: httpUrl,
});

const patchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  code: z.string().min(1).max(50).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  priceIdr: z.number().int().min(1).max(999999999).optional(),
  categoryId: z.string().uuid().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(imageSchema).max(6).optional(),
  links: z.array(linkSchema).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });
  const { id } = await params;
  const p = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, links: true },
  });
  if (!p) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan" } }, { status: 404 });
  return NextResponse.json({
    success: true,
    data: {
      id: p.id, name: p.name, code: p.code, slug: p.slug, description: p.description,
      priceIdr: Number(p.priceIdr), categoryId: p.categoryId,
      category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
      isFeatured: p.isFeatured, isActive: p.isActive,
      images: p.images.map((i) => ({ id: i.id, provider: i.provider, assetId: i.assetId, publicId: i.publicId, secureUrl: i.secureUrl, width: i.width, height: i.height, bytes: i.bytes, format: i.format, altText: i.altText, sortOrder: i.sortOrder })),
      links: p.links.map((l) => ({ id: l.id, marketplaceName: l.marketplaceName, url: l.url })),
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!existing) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan" } }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { body = null; }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const details: Record<string, string> = {};
    for (const issue of parsed.error.issues) details[issue.path.join(".") || "root"] = issue.message;
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Input tidak valid", details } }, { status: 400 });
  }
  const d = parsed.data;

  if (d.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: d.categoryId } });
    if (!cat) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Kategori tidak ditemukan" } }, { status: 400 });
  }

  if (d.code !== undefined) {
    if (d.code) {
      const code = d.code.trim();
      const exists = await prisma.product.findFirst({ where: { code, NOT: { id } } });
      if (exists) return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "Kode produk sudah digunakan" } }, { status: 409 });
      d.code = code;
    } else {
      d.code = null;
    }
  }

  const newIsActive = d.isActive ?? existing.isActive;
  const newImages = d.images;
  const effectiveImageCount = newImages ? newImages.length : existing.images.length;
  if (newIsActive && effectiveImageCount === 0) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Produk aktif wajib memiliki minimal 1 foto" } }, { status: 400 });
  }
  if (newImages && newImages.length > 6) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Maksimal 6 foto per produk" } }, { status: 400 });
  }

  // schedule old images for cleanup if images replaced
  const oldImages = existing.images;
  const newPublicIds = new Set((newImages ?? []).map((i) => i.publicId));
  const removed = (newImages !== undefined) ? oldImages.filter((i) => !newPublicIds.has(i.publicId)) : [];

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: d.name,
        code: d.code,
        description: d.description,
        priceIdr: d.priceIdr !== undefined ? BigInt(d.priceIdr) : undefined,
        categoryId: d.categoryId,
        isFeatured: d.isFeatured,
        isActive: d.isActive,
      },
    });

    if (newImages !== undefined) {
      // replace images
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: newImages.map((img, idx) => ({
          productId: id,
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
      });
    }

    if (d.links !== undefined) {
      await tx.productLink.deleteMany({ where: { productId: id } });
      if (d.links.length) {
        await tx.productLink.createMany({
          data: d.links.map((l) => ({ productId: id, marketplaceName: l.marketplaceName, url: l.url })),
        });
      }
    }
  });

  // schedule cleanup for removed images
  if (removed.length) {
    await prisma.fileCleanupJob.createMany({
      data: removed.map((i) => ({ provider: i.provider, assetId: i.assetId, publicId: i.publicId })),
    });
  }

  // revalidate
  revalidatePath("/");
  revalidatePath(`/produk/${existing.slug}`);

  const updated = await prisma.product.findUnique({ where: { id } });
  return NextResponse.json({ success: true, message: "Produk berhasil diubah", data: { id, slug: updated!.slug } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!existing) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan" } }, { status: 404 });

  // schedule cleanup for all images
  if (existing.images.length) {
    await prisma.fileCleanupJob.createMany({
      data: existing.images.map((i) => ({ provider: i.provider, assetId: i.assetId, publicId: i.publicId })),
    });
  }

  await prisma.product.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath(`/produk/${existing.slug}`);

  return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
}