/**
 * src/app/api/admin/users/route.ts
 *
 * GET /api/admin/users (API.md, FR-12)
 * Mengambil daftar seluruh user terdaftar dengan paginasi.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { apiForbidden, apiInternal } from "@/lib/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") ?? "10", 10)));
    const skip = (page - 1) * pageSize;

    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          xp: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      totalXp: u.role === "ADMIN" ? 0 : u.xp,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Gagal mengambil daftar pengguna (admin):", error);
    return apiInternal("Terjadi kesalahan server saat mengambil daftar pengguna.");
  }
}
