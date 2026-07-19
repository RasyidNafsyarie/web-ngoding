/**
 * src/app/api/auth/[...nextauth]/route.ts
 *
 * Route handler Auth.js v5 untuk semua endpoint /api/auth/*.
 * (sign-in, sign-out, callback, session, csrf, providers)
 */

import { handlers } from "@/lib/auth/auth";

export const { GET, POST } = handlers;
