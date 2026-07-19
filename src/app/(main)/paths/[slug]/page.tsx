import { MainLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";
import { Article, LearningPath } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 60; // ISR revalidate every 60 seconds

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PathDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  let path: (LearningPath & { articles: Article[] }) | null = null;

  try {
    // Fetch path and ordered articles
    path = await prisma.learningPath.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Gagal memuat detail jalur belajar dari database:", error);
  }

  if (!path) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* ── Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs font-semibold text-ink/70"
        >
          <Link href="/" className="hover:text-ink hover:underline">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/paths" className="hover:text-ink hover:underline">
            Jalur Belajar
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink truncate max-w-[200px]">{path.title}</span>
        </nav>

        {/* ── Path Header Card ── */}
        <Card className="mb-12 bg-pond-green/20" hoverable={false}>
          <div className="flex flex-col gap-4">
            <span className="neo-badge w-fit bg-retro-green">Jalur Belajar</span>
            <h1 className="text-sm sm:text-md md:text-lg font-pixel tracking-wide text-ink leading-snug">
              {path.title}
            </h1>
            <p className="text-xs md:text-sm font-bold text-ink/80 leading-relaxed">
              {path.description}
            </p>
            <div className="text-[10px] font-pixel uppercase tracking-widest text-ink/60 mt-2">
              Total {path.articles.length} Modul Pembelajaran
            </div>
          </div>
        </Card>

        {/* ── Articles List ── */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xs md:text-sm font-pixel tracking-wide text-ink mb-2">
            Materi Pembelajaran
          </h2>

          {path.articles.map((article, index) => {
            const stepNum = String(index + 1).padStart(2, "0");
            return (
              <div
                key={article.id}
                className="
                  flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5
                  border-2 border-ink bg-card-white rounded-xl shadow-retro-sm
                  hover:-translate-y-[1px] hover:shadow-retro-lg transition-all duration-150
                "
              >
                <div className="flex items-center gap-4">
                  {/* Step badge */}
                  <div
                    aria-hidden="true"
                    className="
                      h-10 w-10 shrink-0 flex items-center justify-center
                      border-2 border-ink rounded-lg bg-soft-green font-pixel text-xs text-ink shadow-retro-sm
                    "
                  >
                    {stepNum}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm md:text-base text-ink mb-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-ink/60 font-medium">
                      Modul {index + 1} dari Jalur Belajar {path.title}
                    </p>
                  </div>
                </div>

                <Button
                  href={`/paths/${path.slug}/${article.slug}`}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Mulai Belajar →
                </Button>
              </div>
            );
          })}

          {path.articles.length === 0 && (
            <Card className="text-center py-12">
              <p className="text-xs font-bold text-ink/50">
                Belum ada artikel yang dipublikasikan di jalur belajar ini.
              </p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export async function generateStaticParams() {
  try {
    const paths = await prisma.learningPath.findMany({
      select: { slug: true },
    });
    return paths.map((path) => ({
      slug: path.slug,
    }));
  } catch (error) {
    console.warn("Gagal generateStaticParams untuk jalur belajar (database offline):", error);
    return [];
  }
}
