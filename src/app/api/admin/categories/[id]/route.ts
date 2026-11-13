import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(160).optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Kategori tidak ditemukan" } }, { status: 404 });

  let body: unknown; try { body = await req.json(); } catch { body = null; }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    const details: Record<string, string> = {};
    for (const issue of parsed.error.issues) details[issue.path.join(".") || "root"] = issue.message;
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Input tidak valid", details } }, { status: 400 });
  }
  const d = parsed.data;

  if (d.name && d.name !== existing.name) {
    const exists = await prisma.category.findUnique({ where: { name: d.name } });
    if (exists) return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "Nama kategori sudah digunakan" } }, { status: 409 });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: d.name,
      description: d.description,
      thumbnail: d.thumbnail,
      sortOrder: d.sortOrder,
    },
  });
  return NextResponse.json({ success: true, message: "Kategori berhasil diubah", data: { id: updated.id, slug: updated.slug } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!existing) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Kategori tidak ditemukan" } }, { status: 404 });
  if (existing._count.products > 0) {
    return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "Kategori masih digunakan produk. Pindahkan produk terlebih dahulu." } }, { status: 409 });
  }
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
}