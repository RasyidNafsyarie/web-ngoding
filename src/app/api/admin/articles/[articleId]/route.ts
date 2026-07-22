/**
 * src/app/api/admin/articles/[articleId]/route.ts
 *
 * GET, PUT & DELETE /api/admin/articles/[articleId] (API.md)
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
  params: Promise<{ articleId: string }>;
}

const updateArticleSchema = z.object({
  learningPathId: z.string().min(1, "Learning Path wajib dipilih.").optional(),
  title: z.string().min(2, "Judul minimal 2 karakter.").optional(),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).")
    .optional(),
  content: z.string().min(10, "Konten MDX minimal 10 karakter.").optional(),
  order: z.number().int().min(0, "Urutan harus bilangan positif.").optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const resolvedParams = await params;
    const articleId = resolvedParams.articleId;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        learningPath: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!article) {
      return apiNotFound("Artikel tidak ditemukan.");
    }

    return apiSuccess(article);
  } catch (error) {
    console.error("Gagal mengambil detail artikel (admin):", error);
    return apiInternal("Terjadi kesalahan server saat mengambil detail artikel.");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const resolvedParams = await params;
    const articleId = resolvedParams.articleId;

    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
      include: { learningPath: true },
    });

    if (!existingArticle) {
      return apiNotFound("Artikel tidak ditemukan.");
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateArticleSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const updateData = parseResult.data;
    const targetPathId = updateData.learningPathId ?? existingArticle.learningPathId;
    const targetSlug = updateData.slug ?? existingArticle.slug;

    // Jika slug atau path diubah, pastikan keunikan slug di path tujuan
    if (
      (updateData.slug && updateData.slug !== existingArticle.slug) ||
      (updateData.learningPathId && updateData.learningPathId !== existingArticle.learningPathId)
    ) {
      const conflict = await prisma.article.findUnique({
        where: {
          learningPathId_slug: {
            learningPathId: targetPathId,
            slug: targetSlug,
          },
        },
      });

      if (conflict && conflict.id !== articleId) {
        return apiConflict("Slug artikel sudah digunakan dalam Learning Path ini.");
      }
    }

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
      include: { learningPath: true },
    });

    // Revalidasi ISR
    revalidatePath("/paths");
    revalidatePath(`/paths/${existingArticle.learningPath.slug}`);
    revalidatePath(`/paths/${updatedArticle.learningPath.slug}`);
    revalidatePath(`/paths/${existingArticle.learningPath.slug}/${existingArticle.slug}`);
    revalidatePath(`/paths/${updatedArticle.learningPath.slug}/${updatedArticle.slug}`);

    return apiSuccess(updatedArticle);
  } catch (error) {
    console.error("Gagal memperbarui artikel (admin):", error);
    return apiInternal("Terjadi kesalahan server saat memperbarui artikel.");
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const resolvedParams = await params;
    const articleId = resolvedParams.articleId;

    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
      include: { learningPath: true },
    });

    if (!existingArticle) {
      return apiNotFound("Artikel tidak ditemukan.");
    }

    await prisma.article.delete({
      where: { id: articleId },
    });

    // Revalidasi ISR
    revalidatePath("/paths");
    revalidatePath(`/paths/${existingArticle.learningPath.slug}`);
    revalidatePath(`/paths/${existingArticle.learningPath.slug}/${existingArticle.slug}`);

    return apiMessage("Artikel berhasil dihapus.");
  } catch (error) {
    console.error("Gagal menghapus artikel (admin):", error);
    return apiInternal("Terjadi kesalahan server saat menghapus artikel.");
  }
}
