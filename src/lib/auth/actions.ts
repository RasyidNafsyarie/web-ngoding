/**
 * src/lib/auth/actions.ts
 *
 * Server Actions untuk auth:
 *   - register: buat akun baru + auto-login
 *   - logout: clear session, redirect ke homepage
 *
 * Semua input divalidasi dengan Zod sebelum menyentuh DB.
 */

"use server";

import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/auth/validation";
import { AuthError } from "next-auth";

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validasi Zod
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Input tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password } = parsed.data;

  // Cek apakah email sudah terdaftar
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "Email sudah terdaftar. Silakan login.",
    };
  }

  // Hash password dengan bcrypt (cost factor 12)
  const passwordHash = await bcrypt.hash(password, 12);

  // Buat user + account credentials dalam satu transaksi
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        role: "USER",
        xp: 0,
      },
    });

    await tx.account.create({
      data: {
        userId: user.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: email,
        // Password hash disimpan di refresh_token (konvensi internal)
        refresh_token: passwordHash,
      },
    });
  });

  // Auto-login setelah register (M4-07, USER_FLOWS 1.4)
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true, message: "Akun berhasil dibuat!" };
  } catch {
    // Register berhasil tapi auto-login gagal — user bisa login manual
    return {
      success: true,
      message: "Akun berhasil dibuat. Silakan login.",
    };
  }
}

// ─── Login (wrapper untuk signIn dari form) ───────────────────────────────────
export async function loginAction(formData: FormData, callbackUrl?: string): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl ?? "/",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Email atau password salah." };
        default:
          return { success: false, error: "Gagal login. Coba lagi." };
      }
    }
    // signIn dengan redirectTo melempar NEXT_REDIRECT — re-throw agar Next.js handle
    throw error;
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
