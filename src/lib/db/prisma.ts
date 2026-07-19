import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7: PrismaClient wajib menerima driver adapter.
// URL runtime menggunakan DATABASE_URL (pooled via PgBouncer, port 6543) —
// cocok untuk serverless/edge Next.js agar tidak membuka koneksi baru tiap invocation.
//
// Cegah multiple instance PrismaClient saat Next.js hot reload di development.
// Di production setiap invocation adalah fresh — tidak perlu global cache.
// Referensi: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " + "Make sure to add it to your .env file.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
