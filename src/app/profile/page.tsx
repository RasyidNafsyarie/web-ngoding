import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { ProfileView } from "@/components/profile/ProfileView";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Profil Saya",
  description: "Lihat total XP dan progres penyelesaian artikel coding kamu.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    redirect("/login?callbackUrl=/profile");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      articleProgress: {
        orderBy: { completedAt: "desc" },
        include: {
          article: {
            include: {
              learningPath: {
                select: {
                  title: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const isAdmin = dbUser.role === "ADMIN";

  // Jika akun ADMIN memiliki sisa XP lama di DB, bersihkan ke 0 secara permanen
  if (isAdmin && dbUser.xp !== 0) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { xp: 0 },
    });
  }

  const completedArticles = dbUser.articleProgress.map((item) => ({
    articleId: item.articleId,
    completedAt: item.completedAt,
    xpEarned: isAdmin ? 0 : item.xpAwarded,
    articleTitle: item.article.title,
    articleSlug: item.article.slug,
    learningPathTitle: item.article.learningPath.title,
    learningPathSlug: item.article.learningPath.slug,
  }));

  const userData = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    role: dbUser.role,
    xp: isAdmin ? 0 : dbUser.xp,
    createdAt: dbUser.createdAt,
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <ProfileView user={userData} completedArticles={completedArticles} />
      </div>
    </MainLayout>
  );
}
