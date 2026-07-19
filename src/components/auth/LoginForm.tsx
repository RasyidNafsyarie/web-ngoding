"use client";

/**
 * src/components/auth/LoginForm.tsx
 *
 * Form login: email/password + tombol OAuth Google & GitHub.
 * Menggunakan Server Action loginAction untuk submit credentials.
 * Menggunakan signIn dari next-auth/react untuk OAuth.
 */

import { useActionState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { loginAction } from "@/lib/auth/actions";
import type { ActionResult } from "@/lib/auth/actions";

const initialState: ActionResult = { success: true };

function OAuthButton({
  provider,
  label,
  onClick,
}: {
  provider: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-neo-outline w-full flex items-center justify-center gap-3 text-sm"
      aria-label={`Login dengan ${label}`}
    >
      {provider === "google" && (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      )}
      {provider === "github" && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      )}
      {label}
    </button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [, startTransition] = useTransition();

  // Server Action state
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      return loginAction(formData, callbackUrl);
    },
    initialState,
  );

  // Tampilkan error dari URL (mis. OAuth error)
  const urlError = searchParams.get("error");

  const handleOAuth = (provider: "google" | "github") => {
    startTransition(() => {
      signIn(provider, { callbackUrl });
    });
  };

  return (
    <div className="neo-card p-8 w-full max-w-md mx-auto bg-card-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl mb-2 font-pixel">MASUK</h1>
        <p className="text-sm font-semibold text-ink/75 normal-case tracking-normal">
          Belum punya akun?{" "}
          <Link href="/register" className="text-ink underline hover:text-retro-green font-semibold">
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* Error dari URL (OAuth error) */}
      {urlError && (
        <div
          role="alert"
          className="mb-4 p-3 border-2 border-ink rounded-lg bg-destructive/10 text-destructive text-sm font-semibold"
        >
          {urlError === "OAuthAccountNotLinked"
            ? "Email sudah terdaftar dengan metode login lain."
            : "Terjadi kesalahan. Coba lagi."}
        </div>
      )}

      {/* Error dari action */}
      {!state.success && state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 p-3 border-2 border-ink rounded-lg bg-destructive/10 text-destructive text-sm font-semibold"
        >
          {state.error}
        </div>
      )}

      {/* Form credentials */}
      <form action={formAction} className="space-y-4" noValidate>
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
            aria-describedby={!state.success ? "form-error" : undefined}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="neo-input"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-neo-primary w-full"
          aria-busy={isPending}
        >
          {isPending ? "MEMPROSES..." : "MASUK"}
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
        <OAuthButton
          provider="google"
          label="Lanjutkan dengan Google"
          onClick={() => handleOAuth("google")}
        />
        <OAuthButton
          provider="github"
          label="Lanjutkan dengan GitHub"
          onClick={() => handleOAuth("github")}
        />
      </div>
    </div>
  );
}

