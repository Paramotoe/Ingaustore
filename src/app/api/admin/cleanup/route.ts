import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });
  const jobs = await prisma.fileCleanupJob.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ success: true, data: jobs });
}

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });

  const jobs = await prisma.fileCleanupJob.findMany({
    where: { status: { in: ["pending", "failed"] }, attempts: { lt: 5 } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  let done = 0;
  let failed = 0;
  for (const job of jobs) {
    try {
      await cloudinary.uploader.destroy(job.publicId);
      await prisma.fileCleanupJob.update({ where: { id: job.id }, data: { status: "done", attempts: job.attempts + 1, lastError: null } });
      done++;
    } catch (e) {
      await prisma.fileCleanupJob.update({ where: { id: job.id }, data: { status: "failed", attempts: job.attempts + 1, lastError: e instanceof Error ? e.message : "unknown" } });
      failed++;
    }
  }

  return NextResponse.json({ success: true, data: { processed: jobs.length, done, failed } });
}