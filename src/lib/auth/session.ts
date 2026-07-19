/**
 * src/lib/auth/session.ts
 *
 * Helper untuk re-validasi sesi & role secara independen di setiap
 * protected API route (defense-in-depth, M4-14).
 *
 * Tidak bergantung pada middleware — setiap route melakukan validasi sendiri.
 */

import { auth } from "@/lib/auth/auth";
import type { Role } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Ambil session yang sudah tervalidasi dari request saat ini.
 * Role sudah tersedia di token JWT — tidak perlu re-query DB.
 * Return null jika tidak authenticated.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();

  if (!session?.user?.id) return null;

  // Role sudah tersedia di session (dari JWT callback) — tidak perlu re-query DB
  // Defense-in-depth: jika role tidak ada di session (edge case), return null
  if (!session.user.role) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    role: session.user.role as Role,
  };
}

/**
 * Require authenticated user. Throw-safe: return null jika gagal.
 * Gunakan di API route yang butuh login (role USER atau ADMIN).
 */
export async function requireAuth(): Promise<AuthenticatedUser | null> {
  return getAuthenticatedUser();
}

/**
 * Require ADMIN role. Return null jika bukan admin.
 * Gunakan di semua endpoint /api/admin/*.
 */
export async function requireAdmin(): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
