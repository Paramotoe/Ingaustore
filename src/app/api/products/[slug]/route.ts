import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, links: true },
  });
  if (!p || !p.isActive) {
    return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Produk tidak ditemukan" } }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: {
      id: p.id,
      name: p.name,
      code: p.code,
      slug: p.slug,
      description: p.description,
      priceIdr: Number(p.priceIdr),
      category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
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
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    },
  });
}