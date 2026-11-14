import { NextResponse } from "next/server";
import { requireAdmin, verifyOrigin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { generateSecret, otpauthUri } from "@/lib/totp";

export async function POST() {
  if (!(await verifyOrigin())) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Origin tidak valid" } }, { status: 403 });
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });

  const secret = generateSecret();
  await prisma.admin.update({ where: { id: admin.id }, data: { totpSecret: secret } });

  return NextResponse.json({
    success: true,
    data: {
      secret,
      otpauthUri: otpauthUri(secret, admin.email),
      message: "Scan URI dengan aplikasi authenticator. Simpan secret dengan aman.",
    },
  });
}

export async function DELETE() {
  if (!(await verifyOrigin())) return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Origin tidak valid" } }, { status: 403 });
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin belum login" } }, { status: 401 });

  await prisma.admin.update({ where: { id: admin.id }, data: { totpSecret: null } });
  return NextResponse.json({ success: true, message: "MFA dinonaktifkan." });
}