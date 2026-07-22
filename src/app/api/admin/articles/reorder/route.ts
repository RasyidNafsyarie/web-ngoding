/**
 * src/app/api/admin/articles/reorder/route.ts
 *
 * POST /api/admin/articles/reorder (FR-11)
 * Batch update urutan (order) artikel dalam satu learning path.
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  apiMessage,
  apiForbidden,
  apiValidationError,
  apiInternal,
} from "@/lib/utils/api-response";
import { revalidatePath } from "next/cache";

const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, "ID artikel wajib diisi."),
        order: z.number().int().min(0, "Order harus angka positif."),
      }),
    )
    .min(1, "Daftar artikel minimal 1 item."),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const body = await request.json().catch(() => ({}));
    const parseResult = reorderSchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { items } = parseResult.data;

    // Transaksi batch update order
    await prisma.$transaction(
      items.map((item) =>
        prisma.article.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );

    revalidatePath("/paths");

    return apiMessage("Urutan artikel berhasil diperbarui.");
  } catch (error) {
    console.error("Gagal mengubah urutan artikel (admin):", error);
    return apiInternal("Terjadi kesalahan server saat memperbarui urutan artikel.");
  }
}
