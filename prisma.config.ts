import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: URL koneksi dipisah dari schema.prisma ke file ini.
//
// Arsitektur koneksi Supabase:
//   - datasource.url (DIRECT_URL, port 5432) → dipakai Prisma CLI (migrate, generate, studio)
//     karena butuh koneksi langsung, bukan via pooler.
//   - DATABASE_URL (pooled via PgBouncer, port 6543) → dipakai PrismaClient di runtime
//     via driver adapter (@prisma/adapter-pg) agar tiap serverless invocation tidak
//     membuka koneksi baru ke database.
//
// Referensi: https://pris.ly/d/config-datasource

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Jalankan seed otomatis setelah prisma migrate dev (development only)
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL dipakai CLI (migrate/generate/studio) — koneksi langsung tanpa PgBouncer
    url: env("DIRECT_URL"),
  },
});
