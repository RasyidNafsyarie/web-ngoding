"use client";

/**
 * src/components/auth/LogoutButton.tsx
 *
 * Tombol logout — memanggil signOut (client-side next-auth/react).
 * Clear session + redirect ke homepage (USER_FLOWS 2.3) dengan refresh instan.
 */

import { useTransition } from "react";
import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({
  className = "btn-neo-outline",
  children = "KELUAR",
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut({ callbackUrl: "/" });
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={className}
      aria-busy={isPending}
      aria-label="Keluar dari akun"
    >
      {isPending ? "KELUAR..." : children}
    </button>
  );
}
