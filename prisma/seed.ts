/**
 * prisma/seed.ts
 *
 * Seed script untuk mengisi database dengan data awal development:
 *   - 1 akun admin
 *   - 2 LearningPath contoh (HTML Dasar, CSS Dasar)
 *   - Beberapa Article per path dengan konten MDX minimal
 *
 * Jalankan dengan: npm run db:seed
 * (atau: npx prisma db seed)
 */

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as crypto from "crypto";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Hash password sederhana dengan SHA-256 untuk seed (bukan bcrypt agar tidak perlu install di dev).
 *  CATATAN: Akun seed ini hanya untuk development. Di production, bcrypt wajib dipakai (M4-03). */
function hashPasswordForSeed(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const LEARNING_PATHS = [
  {
    title: "HTML Dasar",
    slug: "html-dasar",
    description:
      "Pelajari fondasi web dari nol: elemen, atribut, semantik, dan struktur dokumen HTML yang benar.",
    imageUrl: null,
    articles: [
      {
        title: "Pengenalan HTML",
        slug: "pengenalan-html",
        order: 1,
        isPublished: true,
        content: `# Pengenalan HTML

HTML (HyperText Markup Language) adalah bahasa markup standar untuk membuat halaman web.

## Apa itu HTML?

HTML mendefinisikan **struktur** konten halaman web menggunakan elemen-elemen yang direpresentasikan oleh tag.

\`\`\`html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Halaman Pertamaku</title>
  </head>
  <body>
    <h1>Halo, Dunia!</h1>
    <p>Ini adalah paragraf pertamaku.</p>
  </body>
</html>
\`\`\`

## Struktur Dasar

Setiap dokumen HTML dimulai dengan \`<!DOCTYPE html>\` yang memberitahu browser bahwa ini dokumen HTML5.

<Note>
  Selalu tambahkan atribut \`lang\` pada tag \`<html>\` untuk aksesibilitas dan SEO yang lebih baik.
</Note>
`,
      },
      {
        title: "Elemen & Atribut HTML",
        slug: "elemen-atribut-html",
        order: 2,
        isPublished: true,
        content: `# Elemen & Atribut HTML

Elemen HTML terdiri dari tag pembuka, konten, dan tag penutup.

## Anatomi Elemen

\`\`\`html
<p class="intro">Ini adalah paragraf.</p>
<!-- tag pembuka ^    konten        ^ tag penutup -->
\`\`\`

## Atribut Umum

| Atribut | Kegunaan |
|---------|----------|
| \`id\` | Identifikasi unik elemen |
| \`class\` | Kelompokkan elemen untuk CSS |
| \`href\` | URL tujuan untuk link |
| \`src\` | Sumber untuk gambar/script |
| \`alt\` | Teks alternatif gambar |

## Elemen Void

Beberapa elemen tidak memiliki tag penutup, disebut *void element*:

\`\`\`html
<img src="foto.jpg" alt="Foto pemandangan" />
<br />
<input type="text" />
\`\`\`

<Alert type="info">
  Elemen void tidak perlu tag penutup, tapi menambahkan \`/\` sebelum \`>\` adalah praktik yang baik.
</Alert>
`,
      },
      {
        title: "HTML Semantik",
        slug: "html-semantik",
        order: 3,
        isPublished: true,
        content: `# HTML Semantik

HTML semantik menggunakan elemen yang bermakna untuk mendeskripsikan konten, bukan sekadar tampilannya.

## Mengapa Semantik Penting?

- **Aksesibilitas**: Screen reader memahami struktur halaman
- **SEO**: Mesin pencari mengenali konten penting
- **Maintainability**: Kode lebih mudah dibaca developer lain

## Elemen Semantik Utama

\`\`\`html
<header>
  <nav>...</nav>
</header>

<main>
  <article>
    <h1>Judul Artikel</h1>
    <section>
      <h2>Sub Topik</h2>
      <p>Konten...</p>
    </section>
  </article>
  <aside>Konten sampingan</aside>
</main>

<footer>...</footer>
\`\`\`

<Alert type="warning">
  Hindari menggunakan \`<div>\` dan \`<span>\` untuk semua hal. Gunakan elemen semantik yang tepat.
</Alert>
`,
      },
    ],
  },
  {
    title: "CSS Dasar",
    slug: "css-dasar",
    description:
      "Kuasai styling web: selektor, box model, flexbox, dan cara membuat tampilan yang menarik.",
    imageUrl: null,
    articles: [
      {
        title: "Pengenalan CSS",
        slug: "pengenalan-css",
        order: 1,
        isPublished: true,
        content: `# Pengenalan CSS

CSS (Cascading Style Sheets) mengatur **tampilan** elemen HTML — warna, ukuran, layout, dan animasi.

## Cara Menambahkan CSS

Ada tiga cara menambahkan CSS ke HTML:

\`\`\`html
<!-- 1. External stylesheet (direkomendasikan) -->
<link rel="stylesheet" href="style.css" />

<!-- 2. Internal style -->
<style>
  p { color: blue; }
</style>

<!-- 3. Inline style (hindari jika memungkinkan) -->
<p style="color: blue;">Teks biru</p>
\`\`\`

## Sintaks Dasar

\`\`\`css
selektor {
  properti: nilai;
}

/* Contoh */
h1 {
  color: #4F46E5;
  font-size: 2rem;
}
\`\`\`

<Note>
  External stylesheet adalah cara terbaik karena memisahkan struktur (HTML) dari tampilan (CSS).
</Note>
`,
      },
      {
        title: "Selektor CSS",
        slug: "selektor-css",
        order: 2,
        isPublished: true,
        content: `# Selektor CSS

Selektor menentukan elemen HTML mana yang akan diberi style.

## Jenis Selektor

\`\`\`css
/* Selektor elemen */
p { color: gray; }

/* Selektor class */
.card { border-radius: 12px; }

/* Selektor ID */
#header { background: #4F46E5; }

/* Selektor kombinasi */
.card h2 { font-size: 1.5rem; }

/* Pseudo-class */
a:hover { color: #EA580C; }

/* Pseudo-element */
p::first-line { font-weight: bold; }
\`\`\`

## Spesifisitas

Ketika beberapa aturan bertabrakan, CSS menggunakan spesifisitas:

| Selektor | Spesifisitas |
|----------|--------------|
| Inline style | 1000 |
| ID | 100 |
| Class/Atribut/Pseudo-class | 10 |
| Elemen/Pseudo-element | 1 |

<Alert type="info">
  Hindari penggunaan \`!important\` — ini menyulitkan debugging di kemudian hari.
</Alert>
`,
      },
      {
        title: "Box Model CSS",
        slug: "box-model-css",
        order: 3,
        isPublished: false, // draft — belum dipublish
        content: `# Box Model CSS

Setiap elemen HTML adalah sebuah "kotak" yang terdiri dari content, padding, border, dan margin.

## Visualisasi Box Model

\`\`\`
┌─────────────────────────────┐  ← margin
│  ┌───────────────────────┐  │
│  │ border                │  │
│  │  ┌─────────────────┐  │  │
│  │  │ padding         │  │  │
│  │  │  ┌───────────┐  │  │  │
│  │  │  │  content  │  │  │  │
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
\`\`\`

## box-sizing

\`\`\`css
/* Default: width hanya menghitung content */
.default { box-sizing: content-box; }

/* Direkomendasikan: width termasuk padding & border */
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

<Note>
  Selalu gunakan \`box-sizing: border-box\` — membuat kalkulasi ukuran elemen jauh lebih intuitif.
</Note>
`,
      },
    ],
  },
];

// ─── Seed function ────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Memulai seed database...\n");

  // 1. Upsert akun admin
  // Catatan: password di sini hanya untuk seed development.
  // Saat M4-03 selesai (bcrypt), hash ini akan diganti oleh auth flow sesungguhnya.
  const adminPasswordHash = hashPasswordForSeed("admin123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@ngodingsantuy.dev" },
    update: {
      role: Role.ADMIN,
    },
    create: {
      name: "Admin Ngoding Santuy",
      email: "admin@ngodingsantuy.dev",
      role: Role.ADMIN,
      xp: 0,
      // password disimpan di Account.providerAccountId dengan type "credentials"
      // sesuai pola Credentials Provider NextAuth (detail di M4-03)
    },
  });

  // Upsert Account credentials untuk admin (provider: "credentials")
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "credentials",
        providerAccountId: admin.email,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      type: "credentials",
      provider: "credentials",
      providerAccountId: admin.email,
      // Password hash disimpan di refresh_token sebagai konvensi sementara
      // (akan direfactor saat M4-03 — implementasi bcrypt di Credentials Provider)
      refresh_token: adminPasswordHash,
    },
  });

  console.log(`✅ Admin upserted: ${admin.email} (role: ${admin.role})`);

  // 2. Upsert user biasa untuk testing
  const testUser = await prisma.user.upsert({
    where: { email: "user@ngodingsantuy.dev" },
    update: {},
    create: {
      name: "User Test",
      email: "user@ngodingsantuy.dev",
      role: Role.USER,
      xp: 50,
    },
  });

  console.log(`✅ Test user upserted: ${testUser.email} (role: ${testUser.role})`);

  // 3. Upsert learning paths & articles
  for (const pathData of LEARNING_PATHS) {
    const { articles, ...pathFields } = pathData;

    const learningPath = await prisma.learningPath.upsert({
      where: { slug: pathFields.slug },
      update: {
        title: pathFields.title,
        description: pathFields.description,
        imageUrl: pathFields.imageUrl,
      },
      create: pathFields,
    });

    console.log(`\n📚 Learning path: "${learningPath.title}" (${learningPath.slug})`);

    for (const articleData of articles) {
      const article = await prisma.article.upsert({
        where: {
          learningPathId_slug: {
            learningPathId: learningPath.id,
            slug: articleData.slug,
          },
        },
        update: {
          title: articleData.title,
          order: articleData.order,
          isPublished: articleData.isPublished,
          content: articleData.content,
        },
        create: {
          ...articleData,
          learningPathId: learningPath.id,
        },
      });

      const status = article.isPublished ? "✅ published" : "📝 draft";
      console.log(`   ${status} [${article.order}] ${article.title}`);
    }
  }

  // 4. Seed beberapa progress untuk test user (artikel pertama dari tiap path)
  const htmlPath = await prisma.learningPath.findUnique({
    where: { slug: "html-dasar" },
    include: { articles: { where: { order: 1 }, take: 1 } },
  });

  if (htmlPath?.articles[0]) {
    const firstArticle = htmlPath.articles[0];
    await prisma.userArticleProgress.upsert({
      where: {
        userId_articleId: {
          userId: testUser.id,
          articleId: firstArticle.id,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        articleId: firstArticle.id,
        xpAwarded: 10,
      },
    });
    console.log(
      `\n🎯 Progress seed: ${testUser.email} selesaikan "${firstArticle.title}" (+10 XP)`,
    );
  }

  console.log("\n✨ Seed selesai!\n");
  console.log("─────────────────────────────────────────");
  console.log("Akun untuk development:");
  console.log("  Admin : admin@ngodingsantuy.dev / admin123");
  console.log("  User  : user@ngodingsantuy.dev  (OAuth only untuk test)");
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
