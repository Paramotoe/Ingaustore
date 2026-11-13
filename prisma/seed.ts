import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || !hash) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD_HASH must be set");
    process.exit(1);
  }
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin sudah ada, seed dilewati (password tidak diubah):", email);
  } else {
    await prisma.admin.create({ data: { email, passwordHash: hash } });
    console.log("Admin dibuat:", email);
  }
}

main()
  .catch((e) => { console.error("Seed failed:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());