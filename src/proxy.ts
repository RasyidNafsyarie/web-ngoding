/**
 * src/proxy.ts
 *
 * Guard proteksi route — Next.js 16 mengganti `middleware.ts` → `proxy.ts`.
 * Referensi: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Aturan:
 *   - /admin/*          → wajib login + role ADMIN
 *   - /profile/*        → wajib login (role USER atau ADMIN)
 *   - /login, /register → redirect ke / jika sudah login
 *   - semua lainnya     → publik
 *
 * CATATAN KEAMANAN:
 * Proxy ini adalah layer pertama — bukan satu-satunya layer.
 * Setiap protected API route WAJIB melakukan re-validasi sesi & role
 * secara independen via requireAuth() / requireAdmin() (M4-14).
 * Lihat: https://nextjs.org/blog/security-nextjs-server-components-actions
 */

import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth(function proxy(req: NextAuthRequest) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ── /admin/* — wajib ADMIN ─────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // ── /profile/* — wajib login ───────────────────────────────────────────────
  if (pathname.startsWith("/profile")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── /login & /register — redirect jika sudah login ────────────────────────
  if (pathname === "/login" || pathname === "/register") {
    if (session?.user) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
