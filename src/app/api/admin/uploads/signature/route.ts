import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { body = null; }
  const size = Number(body?.size ?? 0);
  const contentType = String(body?.contentType ?? "");
  if (!ALLOWED.includes(contentType)) {
    return NextResponse.json({ success: false, error: { code: "UPLOAD_ERROR", message: "Format tidak didukung" } }, { status: 400 });
  }
  if (size < 1 || size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: { code: "UPLOAD_ERROR", message: "Ukuran file tidak valid (max 5MB)" } }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "ingaustore/products";
  const publicId = crypto.randomUUID();
  const eager = "w_1600,c_limit,q_auto,f_webp";

  const paramsToSign: Record<string, string> = {
    timestamp: String(timestamp),
    folder,
    public_id: publicId,
    eager,
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    success: true,
    data: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
      publicId,
      eager,
    },
  });
}