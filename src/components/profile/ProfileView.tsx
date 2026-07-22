"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui";

interface CompletedArticleItem {
  articleId: string;
  completedAt: Date | string;
  xpEarned: number;
  articleTitle: string;
  articleSlug: string;
  learningPathTitle: string;
  learningPathSlug: string;
}

interface UserProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  xp: number;
  createdAt: Date | string;
}

interface ProfileViewProps {
  user: UserProfileData;
  completedArticles: CompletedArticleItem[];
}

export function ProfileView({ user, completedArticles }: ProfileViewProps) {
  const formattedJoinedDate = new Date(user.createdAt).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header Profil User ── */}
      <Card padding="p-6 md:p-8" hoverable={false} className="bg-card-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Icon */}
          <div className="relative shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User Avatar"}
                width={80}
                height={80}
                unoptimized
                className="w-20 h-20 rounded-2xl border-2 border-ink object-cover shadow-retro-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-ink bg-retro-green flex items-center justify-center font-pixel text-2xl text-ink shadow-retro-md">
                {(user.name?.[0] ?? user.email[0]).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 neo-badge bg-pond-green text-[9px] uppercase">
              {user.role}
            </span>
          </div>

          {/* User Details */}
          <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left flex-1">
            <h1 className="font-pixel text-base sm:text-lg text-ink">
              {user.name ?? "Pengguna Santuy"}
            </h1>
            <p className="text-xs font-semibold text-ink/60">{user.email}</p>
            <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-ink/70">
              <span className="neo-badge bg-sky-primary/40">
                🗓️ Bergabung {formattedJoinedDate}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Stats Bento Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total XP Card */}
        <Card padding="p-6" hoverable={false} className="bg-retro-green/30 border-2 border-ink">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/60 font-sans">
                Total XP Terkumpul
              </span>
              <span className="font-pixel text-2xl sm:text-3xl text-ink leading-none mt-1">
                ⚡ {user.xp}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl border-2 border-ink bg-retro-green flex items-center justify-center font-pixel text-lg text-ink shadow-retro-sm">
              ✦
            </div>
          </div>
        </Card>

        {/* Artikel Selesai Card */}
        <Card padding="p-6" hoverable={false} className="bg-sky-primary/30 border-2 border-ink">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/60 font-sans">
                Artikel Diselesaikan
              </span>
              <span className="font-pixel text-2xl sm:text-3xl text-ink leading-none mt-1">
                📚 {completedArticles.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl border-2 border-ink bg-sky-primary flex items-center justify-center font-pixel text-lg text-ink shadow-retro-sm">
              ✓
            </div>
          </div>
        </Card>
      </div>

      {/* ── Daftar Artikel Selesai ── */}
      <Card padding="p-6 md:p-8" hoverable={false} className="bg-card-white">
        <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-6">
          <h2 className="font-pixel text-xs sm:text-sm text-ink uppercase tracking-wide">
            🏆 Riwayat Penyelesaian Artikel
          </h2>
          <span className="neo-badge bg-pond-green text-[10px]">
            {completedArticles.length} Modul
          </span>
        </div>

        {completedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-4 border-2 border-dashed border-ink/20 rounded-xl bg-container/30">
            <span className="text-4xl" role="img" aria-label="Buku">
              📖
            </span>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="font-pixel text-xs text-ink">Belum Ada Artikel Selesai</h3>
              <p className="text-xs text-ink/60">
                Jelajahi Jalur Belajar dan selesaikan modul pertama Anda untuk mengumpulkan XP!
              </p>
            </div>
            <Link
              href="/paths"
              className="
                inline-flex items-center gap-2 px-5 py-2.5 mt-2
                border-2 border-ink bg-retro-green text-ink rounded-lg
                font-pixel text-xs shadow-retro-sm
                hover:bg-soft-green hover:shadow-retro-md hover:-translate-x-[0.5px] hover:-translate-y-[0.5px]
                active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed
                transition-all duration-100
              "
            >
              Mulai Belajar Sekarang 🚀
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4" role="list">
            {completedArticles.map((item) => {
              const formattedDate = new Date(item.completedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={item.articleId}
                  className="
                    flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4
                    border-2 border-ink bg-container/20 rounded-xl
                    hover:bg-container/40 transition-colors
                  "
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="neo-badge bg-pond-green text-[9px]">
                        {item.learningPathTitle}
                      </span>
                      <span className="text-[10px] font-semibold text-ink/50">
                        • {formattedDate}
                      </span>
                    </div>
                    <Link
                      href={`/paths/${item.learningPathSlug}/${item.articleSlug}`}
                      className="font-bold text-xs sm:text-sm text-ink hover:underline line-clamp-1"
                    >
                      {item.articleTitle}
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="neo-badge bg-retro-green text-ink font-pixel text-[10px]">
                      {item.xpEarned > 0 ? `+${item.xpEarned} XP` : `0 XP`}
                    </span>
                    <Link
                      href={`/paths/${item.learningPathSlug}/${item.articleSlug}`}
                      aria-label={`Buka artikel ${item.articleTitle}`}
                      className="
                        inline-flex items-center justify-center px-3 py-1.5
                        border border-ink bg-card-white text-ink text-xs font-bold rounded-md
                        hover:bg-soft-green transition-colors
                      "
                    >
                      Buka →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
