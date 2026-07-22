/**
 * src/app/api/admin/articles/route.ts
 *
 * GET & POST /api/admin/articles (API.md)
 * Otorisasi: Khusus role ADMIN.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  apiSuccess,
  apiForbidden,
  apiNotFound,
  apiValidationError,
  apiConflict,
  apiInternal,
} from "@/lib/utils/api-response";
import { revalidatePath } from "next/cache";

const createArticleSchema = z.object({
  learningPathId: z.string().min(1, "Learning Path wajib dipilih."),
  title: z.string().min(2, "Judul minimal 2 karakter."),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)."),
  content: z.string().min(10, "Konten MDX minimal 10 karakter."),
  order: z.number().int().min(0, "Urutan harus bilangan positif.").default(0),
  isPublished: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const { searchParams } = new URL(request.url);
    const learningPathId = searchParams.get("learningPathId");

    const whereCondition = learningPathId ? { learningPathId } : {};

    const articles = await prisma.article.findMany({
      where: whereCondition,
      orderBy: [{ learningPathId: "asc" }, { order: "asc" }],
      select: {
        id: true,
        learningPathId: true,
        title: true,
        slug: true,
        order: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        learningPath: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    return apiSuccess(articles);
  } catch (error) {
    console.error("Gagal mengambil daftar artikel (admin):", error);
    return apiInternal("Terjadi kesalahan server saat mengambil daftar artikel.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const body = await request.json().catch(() => ({}));
    const parseResult = createArticleSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { learningPathId, title, slug, content, order, isPublished } = parseResult.data;

    // Pastikan Learning Path ada
    const path = await prisma.learningPath.findUnique({
      where: { id: learningPathId },
    });

    if (!path) {
      return apiNotFound("Learning Path tidak ditemukan.");
    }

    // Pastikan slug unik dalam learning path tersebut
    const existing = await prisma.article.findUnique({
      where: {
        learningPathId_slug: {
          learningPathId,
          slug,
        },
      },
    });

    if (existing) {
      return apiConflict("Slug artikel sudah digunakan dalam Learning Path ini.");
    }

    const newArticle = await prisma.article.create({
      data: {
        learningPathId,
        title,
        slug,
        content,
        order,
        isPublished,
      },
    });

    // ISR revalidation
    revalidatePath("/paths");
    revalidatePath(`/paths/${path.slug}`);
    if (isPublished) {
      revalidatePath(`/paths/${path.slug}/${newArticle.slug}`);
    }

    return apiSuccess(newArticle, 201);
  } catch (error) {
    console.error("Gagal membuat artikel baru (admin):", error);
    return apiInternal("Terjadi kesalahan server saat membuat artikel baru.");
  }
}
