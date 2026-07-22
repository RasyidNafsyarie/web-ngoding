/**
 * src/app/api/complete-article/route.ts
 *
 * Endpoint POST & GET /api/complete-article (FR-06)
 * - POST: Menandai artikel selesai untuk user yang sedang terautentikasi dan memberikan XP.
 * - GET: Mengecek status penyelesaian artikel tertentu untuk user terautentikasi.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { completeArticleForUser } from "@/lib/progress/progress";
import {
  apiSuccess,
  apiUnauthorized,
  apiNotFound,
  apiValidationError,
  apiInternal,
} from "@/lib/utils/api-response";

const requestSchema = z.object({
  articleId: z.string().min(1, "ID Artikel wajib diisi."),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return apiSuccess({ isCompleted: false, isLoggedIn: false });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return apiNotFound("articleId query parameter wajib diisi.");
    }

    const progress = await prisma.userArticleProgress.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId,
        },
      },
    });

    return apiSuccess({
      isCompleted: Boolean(progress),
      isLoggedIn: true,
    });
  } catch (error) {
    console.error("Gagal mengecek status progress artikel:", error);
    return apiInternal("Terjadi kesalahan server saat mengecek progress.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return apiUnauthorized("Kamu harus masuk untuk menandai artikel selesai.");
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { articleId } = parseResult.data;

    // Pastikan artikel ada dan berstatus dipublikasikan
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
