/**
 * src/app/api/admin/learning-paths/[pathId]/route.ts
 *
 * GET, PUT & DELETE /api/admin/learning-paths/[pathId] (API.md)
 * Otorisasi: Khusus role ADMIN.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  apiSuccess,
  apiMessage,
  apiForbidden,
  apiNotFound,
  apiValidationError,
  apiConflict,
  apiInternal,
} from "@/lib/utils/api-response";
import { revalidatePath } from "next/cache";

interface RouteParams {
  params: Promise<{ pathId: string }>;
}

const updatePathSchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter.").optional(),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).")
    .optional(),
  description: z.string().min(5, "Deskripsi minimal 5 karakter.").optional(),
  imageUrl: z
    .union([z.string().url("URL gambar tidak valid."), z.literal(""), z.null()])
    .optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const resolvedParams = await params;
    const pathId = resolvedParams.pathId;

    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
      include: {
        articles: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
            isPublished: true,
            createdAt: true,
          },
        },
      },
    });

    if (!path) {
      return apiNotFound("Learning path tidak ditemukan.");
    }

    return apiSuccess(path);
  } catch (error) {
    console.error("Gagal mengambil detail learning path (admin):", error);
    return apiInternal("Terjadi kesalahan server saat mengambil detail learning path.");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const resolvedParams = await params;
    const pathId = resolvedParams.pathId;

    const existingPath = await prisma.learningPath.findUnique({
      where: { id: pathId },
    });

    if (!existingPath) {
      return apiNotFound("Learning path tidak ditemukan.");
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updatePathSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const updateData = parseResult.data;

    // Jika slug diubah, pastikan tidak bentrok dengan path lain
    if (updateData.slug && updateData.slug !== existingPath.slug) {
      const slugConflict = await prisma.learningPath.findUnique({
        where: { slug: updateData.slug },
      });
      if (slugConflict) {
        return apiConflict("Slug Learning Path sudah digunakan oleh path lain.");
      }
    }

    const updatedPath = await prisma.learningPath.update({
      where: { id: pathId },
      data: updateData,
    });

    revalidatePath("/paths");
    revalidatePath(`/paths/${updatedPath.slug}`);

    return apiSuccess(updatedPath);
  } catch (error) {
    console.error("Gagal memperbarui learning path (admin):", error);
    return apiInternal("Terjadi kesalahan server saat memperbarui learning path.");
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const resolvedParams = await params;
    const pathId = resolvedParams.pathId;

    const existingPath = await prisma.learningPath.findUnique({
      where: { id: pathId },
    });

    if (!existingPath) {
      return apiNotFound("Learning path tidak ditemukan.");
    }

    await prisma.learningPath.delete({
      where: { id: pathId },
    });

    revalidatePath("/paths");
    revalidatePath(`/paths/${existingPath.slug}`);

    return apiMessage("Learning path dan seluruh artikel terkait berhasil dihapus.");
  } catch (error) {
    console.error("Gagal menghapus learning path (admin):", error);
    return apiInternal("Terjadi kesalahan server saat menghapus learning path.");
  }
}
