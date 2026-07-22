/**
 * src/app/api/users/me/route.ts
 *
 * GET & PATCH /api/users/me (API.md)
 * Mengambil profil & meng-update data diri user terautentikasi.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  apiSuccess,
  apiUnauthorized,
  apiNotFound,
  apiValidationError,
  apiInternal,
} from "@/lib/utils/api-response";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter.").optional(),
  image: z.string().url("URL avatar tidak valid.").nullable().optional(),
});

export async function GET() {
  try {
    const authUser = await requireAuth();
    if (!authUser) {
      return apiUnauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        xp: true,
        _count: {
          select: { articleProgress: true },
        },
      },
    });

    if (!user) {
      return apiNotFound("Pengguna tidak ditemukan.");
    }

    return apiSuccess({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      totalXp: user.role === "ADMIN" ? 0 : user.xp,
      completedArticlesCount: user._count.articleProgress,
    });
  } catch (error) {
    console.error("Gagal mengambil profil pengguna:", error);
    return apiInternal("Terjadi kesalahan server saat mengambil profil.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    if (!authUser) {
      return apiUnauthorized();
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const updatedData = parseResult.data;

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updatedData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        xp: true,
        _count: {
          select: { articleProgress: true },
        },
      },
    });

    return apiSuccess({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      role: updatedUser.role,
      totalXp: updatedUser.role === "ADMIN" ? 0 : updatedUser.xp,
      completedArticlesCount: updatedUser._count.articleProgress,
    });
  } catch (error) {
    console.error("Gagal memperbarui profil pengguna:", error);
    return apiInternal("Terjadi kesalahan server saat meng-update profil.");
  }
}
