import { NextResponse } from "next/server";
import { requireAdmin, verifyOrigin } from "@/lib/admin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  if (!(await verifyOrigin())) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Origin tidak valid" } }, { status: 403 });
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { body = null; }
  const b = (body ?? {}) as { assetId?: unknown; publicId?: unknown; altText?: unknown; sortOrder?: unknown };
  const assetId = String(b.assetId ?? "");
  const publicId = String(b.publicId ?? "");
  if (!assetId || !publicId) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "assetId dan publicId wajib" } }, { status: 400 });
  }

  // verify asset from Cloudinary
  let resource: { asset_id: string; public_id: string; secure_url: string; width: number; height: number; bytes: number; format: string };
  try {
    resource = await cloudinary.api.resource(publicId);
  } catch {
    return NextResponse.json({ success: false, error: { code: "UPLOAD_ERROR", message: "Aset tidak ditemukan di Cloudinary" } }, { status: 400 });
  }

  if (resource.asset_id !== assetId) {
    // cleanup
    await cloudinary.uploader.destroy(publicId).catch(() => {});
    return NextResponse.json({ success: false, error: { code: "UPLOAD_ERROR", message: "Identitas aset tidak cocok" } }, { status: 400 });
  }

  const width = Number(resource.width);
  const height = Number(resource.height);
  const bytes = Number(resource.bytes);
  const format = String(resource.format);

  // policy validation
  if (width < 400 || height < 400 || width > 6000 || height > 6000) {
    await cloudinary.uploader.destroy(publicId).catch(() => {});
    return NextResponse.json({ success: false, error: { code: "UPLOAD_ERROR", message: "Dimensi gambar tidak valid (min 400x400, max 6000px)" } }, { status: 400 });
  }
  if (bytes < 1 || bytes > 5 * 1024 * 1024) {
    await cloudinary.uploader.destroy(publicId).catch(() => {});
    return NextResponse.json({ success: false, error: { code: "UPLOAD_ERROR", message: "Ukuran file tidak valid (max 5MB)" } }, { status: 400 });
  }
  if (!["jpg", "jpeg", "png", "webp"].includes(format)) {
    await cloudinary.uploader.destroy(publicId).catch(() => {});
    return NextResponse.json({ success: false, error: { code: "UPLOAD_ERROR", message: "Format tidak didukung" } }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "Foto berhasil diverifikasi",
    data: {
      provider: "cloudinary",
      assetId: resource.asset_id,
      publicId: resource.public_id,
      secureUrl: resource.secure_url,
      width,
      height,
      bytes,
      format,
      altText: b.altText ? String(b.altText) : null,
      sortOrder: Number(b.sortOrder ?? 1),
    },
  }, { status: 201 });
}