/**
 * src/app/api/users/me/progress/route.ts
 *
 * GET /api/users/me/progress (API.md)
 * Mengambil daftar seluruh artikel yang telah diselesaikan oleh user.
 */

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiUnauthorized, apiInternal } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const authUser = await requireAuth();
    if (!authUser) {
      return apiUnauthorized();
    }

    const progressRecords = await prisma.userArticleProgress.findMany({
      where: { userId: authUser.id },
      orderBy: { completedAt: "desc" },
      select: {
        articleId: true,
        completedAt: true,
        xpAwarded: true,
        article: {
          select: {
            title: true,
            slug: true,
            order: true,
            learningPath: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const data = progressRecords.map((record) => ({
      articleId: record.articleId,
      completedAt: record.completedAt,
      xpEarned: authUser.role === "ADMIN" ? 0 : record.xpAwarded,
      articleTitle: record.article.title,
      articleSlug: record.article.slug,
      learningPathTitle: record.article.learningPath.title,
      learningPathSlug: record.article.learningPath.slug,
    }));

    return apiSuccess(data);
  } catch (error) {
    console.error("Gagal mengambil progress user:", error);
    return apiInternal("Terjadi kesalahan server saat mengambil progress.");
  }
}
