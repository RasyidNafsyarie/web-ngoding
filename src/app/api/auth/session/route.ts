/**
 * src/app/api/auth/session/route.ts
 *
 * GET /api/auth/session
 * Mengembalikan status sesi user saat ini untuk konsumsi client.
 * Public endpoint — return null jika tidak authenticated.
 */

import { auth } from "@/lib/auth/auth";
import { apiSuccess } from "@/lib/utils/api-response";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return apiSuccess(null);
  }

  return apiSuccess({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    },
    expires: session.expires,
  });
}
