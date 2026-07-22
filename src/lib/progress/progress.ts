/**
 * src/lib/progress/progress.ts
 *
 * Core logic untuk progress tracking & awarding XP (FR-06).
 * Aturan: XP 100 diberikan HANYA untuk role USER.
 * Akun role ADMIN tetap dapat mencatat progres artikel untuk testing, tetapi 0 XP.
 */

import { prisma } from "@/lib/db/prisma";
import type { Role } from "@prisma/client";

export const DEFAULT_ARTICLE_XP = 100;

export interface CompleteArticleResult {
  articleId: string;
  xpEarned: number;
  newTotalXp: number;
  alreadyCompleted: boolean;
}

/**
 * Tandai artikel selesai untuk user dan berikan XP jika role USER.
 * Idempoten: Jika artikel sudah pernah diselesaikan, tidak menambah XP lagi.
 */
export async function completeArticleForUser(
  userId: string,
  articleId: string,
  userRole: Role = "USER",
): Promise<CompleteArticleResult> {
  // 1. Cek apakah progres sudah ada
  const existingProgress = await prisma.userArticleProgress.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });

  const currentXp = currentUser?.xp ?? 0;

  if (existingProgress) {
    return {
      articleId,
      xpEarned: 0,
      newTotalXp: currentXp,
      alreadyCompleted: true,
    };
  }

  // 2. Jika akun ber-role ADMIN: catat progres dengan 0 XP dan pastikan User.xp tetap 0
  if (userRole === "ADMIN") {
    if (!existingProgress) {
      await prisma.userArticleProgress.create({
        data: {
          userId,
          articleId,
          xpAwarded: 0,
        },
      });
    }

    // Bersihkan User.xp admin di DB jika sebelumnya tersisa dari testing
    if (currentUser && currentUser.xp !== 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: 0 },
      });
    }

    return {
      articleId,
      xpEarned: 0,
      newTotalXp: 0,
      alreadyCompleted: Boolean(existingProgress),
    };
  }

  // 3. Jika akun ber-role USER biasa: buat progres & increment User.xp (+100) secara atomik
  const [, updatedUser] = await prisma.$transaction([
    prisma.userArticleProgress.create({
      data: {
        userId,
        articleId,
        xpAwarded: DEFAULT_ARTICLE_XP,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: DEFAULT_ARTICLE_XP,
        },
      },
      select: { xp: true },
    }),
  ]);

  return {
    articleId,
    xpEarned: DEFAULT_ARTICLE_XP,
    newTotalXp: updatedUser.xp,
    alreadyCompleted: false,
  };
}
