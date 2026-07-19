/**
 * src/lib/auth/validation.ts
 *
 * Skema Zod untuk validasi input auth di server.
 * Dipakai di auth.ts (authorize), register action, dan API routes.
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Format email tidak valid")
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: "Password wajib diisi" }).min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Nama wajib diisi" })
    .min(2, "Nama minimal 2 karakter")
    .max(50, "Nama maksimal 50 karakter")
    .trim(),
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Format email tidak valid")
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter"), // bcrypt max 72 bytes
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
