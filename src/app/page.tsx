import { MainLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";
import { Article, LearningPath } from "@prisma/client";

export const revalidate = 60; // Revalidate homepage every 60 seconds (ISR)

export default async function Home() {
  let paths: (LearningPath & { articles: { id: string }[] })[] = [];
  let latestArticles: (Article & { learningPath: LearningPath })[] = [];

  try {
    // Fetch featured learning paths
    paths = await prisma.learningPath.findMany({
      take: 3,
      include: {
        articles: {
          where: { isPublished: true },
          select: { id: true },
        },
      },
    });

    // Fetch latest published articles
    latestArticles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        learningPath: true,
      },
    });
  } catch (error) {
    console.error("Gagal memuat data beranda dari database:", error);
  }

  return (
    <MainLayout>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative border-b-2 border-ink bg-sky-primary overflow-hidden min-h-[60vh] flex items-center">
        {/* Background grid texture */}
        <div
          className="absolute inset-0 bg-grid opacity-25 pointer-events-none"
          aria-hidden="true"
        />

        {/* Ambient floating clouds decoration */}
        <div className="absolute top-8 left-10 animate-float opacity-75 pointer-events-none hidden md:block">
          <span className="text-ink font-pixel text-[9px] bg-card-white border-2 border-ink rounded-full px-4 py-1.5 shadow-retro-sm">
            ☁️ Belajar Santuy
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24 w-full">
          <div className="flex flex-col gap-8 max-w-3xl">
            {/* Badge */}
            <span className="neo-badge w-fit">✦ Platform Coding Indonesia</span>

            {/* Headline using pixel font */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-pixel leading-normal tracking-wide text-ink">
              Belajar Coding{" "}
              <span className="inline-block bg-retro-green px-4 py-1 border-2 border-ink rounded-lg shadow-retro-sm">
                Santai
              </span>
            </h1>

            <p className="text-xs md:text-sm font-bold text-ink max-w-xl leading-relaxed">
              Platform belajar coding interaktif berbahasa Indonesia. HTML, CSS, JavaScript —
              semuanya bisa dipraktikkan langsung di browser dengan editor & console bawaan.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button href="/paths" variant="primary" size="md">
                Mulai Belajar →
              </Button>
              <Button href="/playground" variant="outline" size="md">
                Coba Playground
              </Button>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div
            className="absolute top-16 right-12 hidden lg:flex items-center justify-center w-28 h-28 border-2 border-ink rounded-xl bg-pond-green font-semibold text-2xl text-ink rotate-6 shadow-retro-md"
            aria-hidden="true"
          >
            &lt;/&gt;
          </div>
          <div
            className="absolute bottom-16 right-36 hidden lg:flex items-center justify-center w-20 h-20 border-2 border-ink rounded-xl bg-soft-green font-semibold text-xl text-ink -rotate-3 shadow-retro-md"
            aria-hidden="true"
          >
            &#123;&#125;
          </div>
        </div>
      </section>

      {/* ── Featured Learning Paths ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-xs md:text-sm font-pixel tracking-wider text-ink">
              Learning Paths
            </h2>
            <span className="neo-badge rotate-1 bg-retro-green">Unggulan</span>
          </div>
          <Button href="/paths" variant="outline" size="sm">
            Lihat Semua Path →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paths.map((path) => (
            <Card key={path.id} className="flex flex-col h-full justify-between">
              <div>
                <div className="border-b-2 border-ink -mx-6 -mt-6 mb-4 px-6 py-3 bg-pond-green rounded-t-[10px] flex justify-between items-center">
                  <h3 className="font-pixel text-[9px] tracking-wide text-ink truncate max-w-[70%]">
                    {path.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 border border-ink bg-card-white rounded-md">
                    {path.articles.length} Materi
                  </span>
                </div>
                <p className="text-xs text-ink leading-relaxed mb-6 font-medium">
                  {path.description}
                </p>
              </div>
              <Button href={`/paths/${path.slug}`} variant="secondary" className="w-full">
                Mulai Belajar
              </Button>
            </Card>
          ))}

          {paths.length === 0 && (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <p className="text-sm font-bold text-ink/60">
                  Belum ada Jalur Belajar yang tersedia.
                </p>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* ── Latest Articles ─────────────────────────────────────── */}
      <section className="border-t-2 border-ink bg-card-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-xs md:text-sm font-pixel tracking-wider text-ink">
              Artikel Terbaru
            </h2>
            <span className="neo-badge -rotate-1 bg-sky-primary">Materi Terkini</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestArticles.map((article) => (
              <Card key={article.id} className="flex flex-col justify-between" padding="p-5">
                <div>
                  <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 border border-ink bg-soft-green rounded-full mb-3 uppercase">
                    {article.learningPath.title}
                  </span>
                  <h3 className="font-bold text-sm text-ink mb-2 leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-ink/75 line-clamp-3 mb-4">
                    Pelajari materi {article.title} dalam jalur belajar {article.learningPath.title}
                    .
                  </p>
                </div>
                <Button
                  href={`/paths/${article.learningPath.slug}/${article.slug}`}
                  variant="outline"
                  size="sm"
                  className="w-full text-center"
                >
                  Baca Artikel
                </Button>
              </Card>
            ))}

            {latestArticles.length === 0 && (
              <div className="col-span-full">
                <p className="text-center text-xs font-bold text-ink/50 py-8">
                  Belum ada artikel terbaru.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Color Palette section ───────────────────────────────── */}
      <section className="border-y-2 border-ink bg-ink py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-[10px] font-pixel tracking-widest text-card-white mb-8 uppercase">
            Warna (Palette)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: "Sky Blue", hex: "#87CEEB", bg: "bg-[#87CEEB]", text: "text-ink" },
              { name: "Pond Green", hex: "#B8D8BA", bg: "bg-[#B8D8BA]", text: "text-ink" },
              { name: "Card White", hex: "#FAFAF5", bg: "bg-[#FAFAF5]", text: "text-ink" },
              { name: "Retro Green", hex: "#4ade80", bg: "bg-[#4ade80]", text: "text-ink" },
              { name: "Ink Black", hex: "#1a1a2e", bg: "bg-[#1a1a2e]", text: "text-white" },
            ].map((color) => (
              <div
                key={color.hex}
                className={`
                  ${color.bg} ${color.text}
                  border-2 border-ink p-4 aspect-square rounded-lg
                  flex flex-col justify-end
                `}
                style={{ boxShadow: "3px 3px 0px 0px var(--color-card-white)" }}
              >
                <p className="font-pixel text-[8px] uppercase tracking-wider mb-1">{color.name}</p>
                <p className="font-mono text-[10px] font-semibold opacity-80">{color.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
