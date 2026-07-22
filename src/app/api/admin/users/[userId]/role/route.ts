/**
 * src/app/api/admin/users/[userId]/role/route.ts
 *
 * PATCH /api/admin/users/[userId]/role (API.md, FR-12)
 * Memperbarui role pengguna (USER <-> ADMIN).
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";
import {
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiValidationError,
  apiInternal,
} from "@/lib/utils/api-response";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

const updateRoleSchema = z.object({
  role: z.enum([Role.USER, Role.ADMIN], {
    errorMap: () => ({ message: "Role harus bernilai USER atau ADMIN." }),
  }),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const resolvedParams = await params;
    const userId = resolvedParams.userId;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return apiNotFound("Pengguna tidak ditemukan.");
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateRoleSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { role } = parseResult.data;

    // Jika diubah menjadi ADMIN, pastikan xp dibersihkan menjadi 0
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        ...(role === Role.ADMIN ? { xp: 0 } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
      },
    });

    return apiSuccess({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      totalXp: updatedUser.role === Role.ADMIN ? 0 : updatedUser.xp,
    });
  } catch (error) {
    console.error("Gagal memperbarui role pengguna (admin):", error);
    return apiInternal("Terjadi kesalahan server saat memperbarui role pengguna.");
  }
}
