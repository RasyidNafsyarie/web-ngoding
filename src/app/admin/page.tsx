import Link from "next/link";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalPaths, totalArticles, publishedArticles, totalUsers] = await Promise.all([
    prisma.learningPath.count(),
    prisma.article.count(),
    prisma.article.count({ where: { isPublished: true } }),
    prisma.user.count(),
  ]);

  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      learningPath: {
        select: { title: true, slug: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <h1 className="font-pixel text-base sm:text-lg text-ink">Dashboard Admin</h1>
          <p className="text-xs text-ink/70 font-semibold mt-1">
            Ringkasan statistik konten dan aktivitas platform Ngoding Santuy.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="
            inline-flex items-center gap-2 px-4 py-2.5 w-fit
            border-2 border-ink bg-retro-green text-ink rounded-lg font-pixel text-xs
            shadow-retro-sm hover:bg-soft-green hover:-translate-x-[0.5px] hover:-translate-y-[0.5px]
            active:translate-x-[1px] active:translate-y-[1px] transition-all
          "
        >
          <span>✍️ Tulis Artikel Baru</span>
        </Link>
      </div>

      {/* ── Stats Bento Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Path */}
        <Card padding="p-5" hoverable={false} className="bg-sky-primary/30 border-2 border-ink">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-ink/60 font-sans">
              Jalur Belajar
            </span>
            <span className="font-pixel text-2xl text-ink">🗺️ {totalPaths}</span>
          </div>
        </Card>

        {/* Total Artikel */}
        <Card padding="p-5" hoverable={false} className="bg-pond-green/30 border-2 border-ink">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-ink/60 font-sans">
              Total Artikel
            </span>
            <span className="font-pixel text-2xl text-ink">📝 {totalArticles}</span>
          </div>
        </Card>

        {/* Artikel Terpublikasi */}
        <Card padding="p-5" hoverable={false} className="bg-retro-green/30 border-2 border-ink">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-ink/60 font-sans">
              Terpublikasi
            </span>
            <span className="font-pixel text-2xl text-ink">🚀 {publishedArticles}</span>
          </div>
        </Card>

        {/* Total Users */}
        <Card padding="p-5" hoverable={false} className="bg-container/40 border-2 border-ink">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase text-ink/60 font-sans">
              Pengguna Terdaftar
            </span>
            <span className="font-pixel text-2xl text-ink">👥 {totalUsers}</span>
          </div>
        </Card>
      </div>

      {/* ── Quick Actions & Recent Updates ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Artikel Terbaru */}
        <Card padding="p-6" hoverable={false} className="lg:col-span-2 bg-card-white">
          <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-4">
            <h2 className="font-pixel text-xs text-ink uppercase">⏱️ Pembaruan Artikel Terakhir</h2>
            <Link
              href="/admin/articles"
              className="text-xs font-bold text-ink underline hover:text-retro-green"
            >
              Kelola Semua →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between gap-3 p-3 border-2 border-ink bg-container/20 rounded-lg"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="neo-badge bg-pond-green text-[9px]">
                      {article.learningPath.title}
                    </span>
                    <span
                      className={`neo-badge text-[9px] ${
                        article.isPublished ? "bg-retro-green" : "bg-container"
                      }`}
                    >
                      {article.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <span className="font-bold text-xs text-ink truncate">{article.title}</span>
                </div>
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="px-3 py-1 border border-ink bg-card-white text-xs font-bold rounded hover:bg-soft-green shrink-0"
                >
                  Edit ✏️
                </Link>
              </div>
            ))}
          </div>
        </Card>

        {/* Right 1 Col: Quick Links */}
        <Card padding="p-6" hoverable={false} className="bg-card-white">
          <h2 className="font-pixel text-xs text-ink uppercase border-b-2 border-ink pb-3 mb-4">
            ⚡ Tindakan Cepat
          </h2>

          <div className="flex flex-col gap-3">
            <Link
              href="/admin/paths"
              className="p-3 border-2 border-ink bg-sky-primary/20 rounded-lg text-xs font-bold text-ink hover:bg-sky-primary/40 flex items-center justify-between"
            >
              <span>🗺️ Kelola Learning Paths</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin/articles/new"
              className="p-3 border-2 border-ink bg-retro-green/20 rounded-lg text-xs font-bold text-ink hover:bg-retro-green/40 flex items-center justify-between"
            >
              <span>✍️ Tulis Modul Artikel Baru</span>
              <span>→</span>
            </Link>
            <Link
              href="/admin/users"
              className="p-3 border-2 border-ink bg-pond-green/20 rounded-lg text-xs font-bold text-ink hover:bg-pond-green/40 flex items-center justify-between"
            >
              <span>👥 Lihat Daftar Pengguna</span>
              <span>→</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
