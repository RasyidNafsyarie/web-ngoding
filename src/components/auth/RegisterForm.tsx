"use client";

/**
 * src/components/auth/RegisterForm.tsx
 *
 * Form register: nama, email, password + tombol OAuth.
 * Auto-login setelah register berhasil (USER_FLOWS 1.4).
 */

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { registerAction } from "@/lib/auth/actions";
import type { ActionResult } from "@/lib/auth/actions";
import { useEffect } from "react";

const initialState: ActionResult = { success: true };

export default function RegisterForm() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      return registerAction(formData);
    },
    initialState,
  );

  // Redirect ke home setelah register + auto-login berhasil
  useEffect(() => {
    if (state.success && state.message?.includes("berhasil dibuat!")) {
      router.replace("/");
    }
  }, [state, router]);

  const handleOAuth = (provider: "google" | "github") => {
    startTransition(() => {
      signIn(provider, { callbackUrl: "/" });
    });
  };

  return (
    <div className="neo-card p-8 w-full max-w-md mx-auto bg-card-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl mb-2 font-pixel">DAFTAR</h1>
        <p className="text-sm font-semibold text-ink/75 normal-case tracking-normal">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-ink underline hover:text-retro-green font-semibold">
            Masuk di sini
          </Link>
        </p>
      </div>

      {/* Success message */}
      {state.success && state.message && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 p-3 border-2 border-ink rounded-lg bg-retro-green/10 text-ink text-sm font-semibold"
        >
          {state.message}
        </div>
      )}

      {/* Error global */}
      {!state.success && state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 p-3 border-2 border-ink rounded-lg bg-destructive/10 text-destructive text-sm font-semibold"
        >
          {state.error}
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Nama Lengkap
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Nama kamu"
            className="neo-input"
          />
          {!state.success && state.fieldErrors?.name && (
            <p className="mt-1 text-xs font-semibold text-destructive" role="alert">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="kamu@email.com"
            className="neo-input"
          />
          {!state.success && state.fieldErrors?.email && (
            <p className="mt-1 text-xs font-semibold text-destructive" role="alert">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Minimal 8 karakter"
            className="neo-input"
          />
          {!state.success && state.fieldErrors?.password && (
            <p className="mt-1 text-xs font-semibold text-destructive" role="alert">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-neo-primary w-full"
          aria-busy={isPending}
        >
          {isPending ? "MENDAFTAR..." : "DAFTAR SEKARANG"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-ink" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-card-white text-xs font-semibold uppercase tracking-widest text-ink/65">atau</span>
        </div>
      </div>

      {/* OAuth buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          className="btn-neo-outline w-full text-sm font-semibold"
          aria-label="Daftar dengan Google"
        >
          Daftar dengan Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("github")}
          className="btn-neo-outline w-full text-sm font-semibold"
          aria-label="Daftar dengan GitHub"
        >
          Daftar dengan GitHub
        </button>
      </div>
    </div>
  );
}

