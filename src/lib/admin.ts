import { auth } from "@/auth";
import { prisma } from "./prisma";

export async function requireAdmin() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const email = session?.user?.email;
  if (!userId || !email) return null;

  const admin = await prisma.admin.findUnique({ where: { id: userId } });
  if (!admin || admin.email.toLowerCase() !== email.toLowerCase()) return null;
  return admin;
}