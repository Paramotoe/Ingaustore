import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Kode verifikasi", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        const code = String(credentials?.code ?? "").trim();

        // Determine client IP (best-effort, server-side).
        let ip = "unknown";
        try {
          const h = await headers();
          ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
        } catch {
          ip = "unknown";
        }

        // Rate limit: block if too many failed attempts from this IP in the window.
        const since = new Date(Date.now() - WINDOW_MS);
        const failedCount = await prisma.loginAttempt.count({
          where: { ip, success: false, createdAt: { gte: since } },
        });
        if (failedCount >= MAX_ATTEMPTS) {
          await prisma.loginAttempt.create({ data: { ip, email: email || null, success: false } });
          return null;
        }

        if (!email || !password) {
          await prisma.loginAttempt.create({ data: { ip, email: email || null, success: false } });
          return null;
        }

        const admin = await prisma.admin.findUnique({ where: { email } });
        const passwordOk = !!admin && (await bcrypt.compare(password, admin.passwordHash));

        // MFA: if admin has totpSecret, require valid TOTP code.
        let mfaOk = true;
        if (admin?.totpSecret) {
          const { verifyTotp } = await import("@/lib/totp");
          mfaOk = verifyTotp(admin.totpSecret, code);
        }

        const ok = passwordOk && mfaOk;

        await prisma.loginAttempt.create({ data: { ip, email, success: ok } });

        if (!ok || !admin) return null;
        return { id: admin.id, email: admin.email, name: "Admin" };
      },
    }),
  ],
});