import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import "dotenv/config";

// Menghapus sintaks markdown, MDX, dan tag JSX kustom agar teks indeks pencarian bersih
function stripMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/[#*`_~]/g, "") // Hapus karakter format markdown biasa
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Ubah tautan [teks](url) -> teks
    .replace(/<[^>]+>/g, "") // Hapus tag JSX/HTML seperti <Alert>, <Playground> beserta atributnya
    .replace(/\s+/g, " ") // Padatkan spasi berlebih
    .trim();
}

// Menulis berkas cadangan (fallback) dengan indeks kosong saat database offline
function writeFallbackIndex(outputPath: string) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify([], null, 2), "utf-8");
  console.log("✅ Berkas indeks pencarian cadangan (kosong) berhasil ditulis.");
}

async function main() {
  console.log("⏳ Memulai pembuatan indeks pencarian statis...");
  const connectionString = process.env.DATABASE_URL;
  const outputPath = path.join(process.cwd(), "public", "search-index.json");

  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL tidak diset. Membuat indeks cadangan kosong.");
    writeFallbackIndex(outputPath);
    return;
  }

  let prisma: PrismaClient | null = null;

  try {
    // Gunakan PrismaPg dengan connectionString langsung seperti di seed.ts & prisma.ts
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({ adapter });

    // Ambil artikel yang dipublikasikan saja
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      include: {
        learningPath: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    console.log(`🔍 Ditemukan ${articles.length} artikel terpublikasi untuk diindeks.`);

    const searchData = articles.map((article) => {
      const cleanContent = stripMarkdown(article.content);
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        pathTitle: article.learningPath.title,
        pathSlug: article.learningPath.slug,
        content: cleanContent,
      };
    });

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2), "utf-8");
    console.log(`✅ Sukses membuat indeks pencarian di: ${outputPath}`);
  } catch (error) {
    console.error("❌ Gagal menyusun indeks pencarian dari database. Menulis indeks cadangan.");
    console.error(error);
    writeFallbackIndex(outputPath);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

main();
