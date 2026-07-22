/**
 * src/app/api/articles/[articleId]/complete/route.ts
 *
 * Endpoint POST /api/articles/[articleId]/complete (API.md)
 * Menandai artikel selesai untuk user yang sedang terautentikasi dan memberikan XP.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { completeArticleForUser } from "@/lib/progress/progress";
import { apiSuccess, apiUnauthorized, apiNotFound, apiInternal } from "@/lib/utils/api-response";

interface RouteParams {
  params: Promise<{ articleId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    if (!user) {
      return apiUnauthorized("Kamu harus masuk untuk menandai artikel selesai.");
    }

    const resolvedParams = await params;
    const articleId = resolvedParams.articleId;

    if (!articleId) {
      return apiNotFound("ID Artikel wajib diisi.");
    }

    // Pastikan artikel ada dan dipublikasikan
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, isPublished: true },
    });

    if (!article || !article.isPublished) {
      return apiNotFound("Artikel tidak ditemukan atau belum dipublikasikan.");
    }

    const result = await completeArticleForUser(user.id, article.id, user.role);

    return apiSuccess({
      articleId: result.articleId,
      xpEarned: result.xpEarned,
      newTotalXp: result.newTotalXp,
      alreadyCompleted: result.alreadyCompleted,
    });
  } catch (error) {
    console.error("Gagal memproses penyelesaian artikel:", error);
    return apiInternal("Terjadi kesalahan server saat menyimpan progres.");
  }
}
