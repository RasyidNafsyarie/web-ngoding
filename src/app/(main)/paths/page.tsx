import type { Metadata } from "next";
import { MainLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";
import { LearningPath } from "@prisma/client";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Jalur Belajar",
  description:
    "Pilih jalur belajar coding yang sesuai dengan kebutuhanmu. Kurikulum terstruktur dari Web Development dasar hingga tingkat lanjut.",
  openGraph: {
    title: "Jalur Belajar | Ngoding Santuy",
    description:
      "Pilih jalur belajar coding yang sesuai dengan kebutuhanmu. Kurikulum terstruktur dari Web Development dasar hingga tingkat lanjut.",
    type: "website",
  },
};

export const revalidate = 60; // ISR revalidate every 60 seconds

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PathsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  let paths: (LearningPath & { articles: { id: string }[] })[] = [];
  let total = 0;

  try {
    // Fetch paths and count
    const [pathsData, totalData] = await Promise.all([
      prisma.learningPath.findMany({
        skip,
        take: limit,
        include: {
          articles: {
            where: { isPublished: true },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.learningPath.count(),
    ]);
    paths = pathsData;
    total = totalData;
  } catch (error) {
    console.error("Gagal memuat data jalur belajar dari database:", error);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* ── Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs font-semibold text-ink/70"
        >
          <Link href="/" className="hover:text-ink hover:underline">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Jalur Belajar</span>
        </nav>

        {/* ── Header ── */}
        <div className="max-w-2xl mb-12 flex flex-col gap-4">
          <span className="neo-badge w-fit bg-soft-green">Daftar Materi</span>
          <h1 className="text-lg md:text-xl font-pixel tracking-wide text-ink">Jalur Belajar</h1>
          <p className="text-xs md:text-sm font-bold text-ink/80 leading-relaxed">
            Pilih jalur belajar coding yang sesuai dengan kebutuhanmu. Seluruh materi dirancang
            secara berurutan, terstruktur, ramah pemula, dan dapat dicoba langsung di browser.
          </p>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
              <Card className="text-center py-16">
                <p className="text-sm font-bold text-ink/50">Jalur Belajar belum tersedia.</p>
              </Card>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 border-t-2 border-ink pt-8">
            <Button
              href={`/paths?page=${page - 1}`}
              variant="outline"
              size="sm"
              disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              ← Sebelumnya
            </Button>

            <div className="px-4 py-2 border-2 border-ink bg-card-white rounded-lg shadow-retro-sm font-pixel text-[10px] text-ink">
              Hal {page} dari {totalPages}
            </div>

            <Button
              href={`/paths?page=${page + 1}`}
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            >
              Berikutnya →
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
