import { auth } from "@/auth";
import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function requireAdmin() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const email = session?.user?.email;
  if (!userId || !email) return null;

  const admin = await prisma.admin.findUnique({ where: { id: userId } });
  if (!admin || admin.email.toLowerCase() !== email.toLowerCase()) return null;
  return admin;
}

// CSRF/origin check for state-changing admin requests.
export async function verifyOrigin(): Promise<boolean> {
  try {
    const h = await headers();
    const origin = h.get("origin");
    const host = h.get("host");
    if (!origin || !host) return false;
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}