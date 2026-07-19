/**
 * src/types/next-auth.d.ts
 *
 * Type augmentation untuk Auth.js v5.
 * Menambahkan field `id` dan `role` ke Session.user dan JWT token.
 */

import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
