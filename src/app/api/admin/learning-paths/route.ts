/**
 * src/app/api/admin/learning-paths/route.ts
 *
 * GET & POST /api/admin/learning-paths (API.md)
 * Otorisasi: Khusus role ADMIN.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  apiSuccess,
  apiForbidden,
  apiValidationError,
  apiConflict,
  apiInternal,
} from "@/lib/utils/api-response";
import { revalidatePath } from "next/cache";

const createPathSchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter."),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)."),
  description: z.string().min(5, "Deskripsi minimal 5 karakter."),
  imageUrl: z
    .union([z.string().url("URL gambar tidak valid."), z.literal(""), z.null()])
    .optional(),
});

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return apiForbidden("Akses khusus admin.");
    }

    const paths = await prisma.learningPath.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { articles: true },
        },
      },
    });

    const data = paths.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      imageUrl: p.imageUrl,
      articleCount: p._count.articles,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return apiSuccess(data);
  } catch (error) {
    console.error("Gagal mengambil learning paths (admin):", error);
    return apiInternal("Terjadi kesalahan server saat mengambil learning paths.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return apiForbidden("Akses khusus admin.");
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createPathSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { title, slug, description, imageUrl } = parseResult.data;

    // Cek keunikan slug / title
    const existing = await prisma.learningPath.findFirst({
      where: {
        OR: [{ slug }, { title }],
      },
    });

    if (existing) {
      return apiConflict("Judul atau slug Learning Path sudah digunakan.");
    }

    const newPath = await prisma.learningPath.create({
      data: {
        title,
        slug,
        description,
        imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl : null,
      },
    });

    revalidatePath("/paths");

    return apiSuccess(
      {
        id: newPath.id,
        title: newPath.title,
        slug: newPath.slug,
        description: newPath.description,
        imageUrl: newPath.imageUrl,
        articleCount: 0,
        createdAt: newPath.createdAt,
      },
      201,
    );
  } catch (error) {
    console.error("Gagal membuat learning path (admin):", error);
    return apiInternal("Terjadi kesalahan server saat membuat learning path.");
  }
}
