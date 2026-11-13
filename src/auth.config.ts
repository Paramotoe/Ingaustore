import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma, no bcrypt). Used by proxy.ts (edge runtime)
// and as base for the full auth config in auth.ts.
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [],
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
  },
};