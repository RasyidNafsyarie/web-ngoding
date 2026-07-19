"use client";

/**
 * src/components/auth/LogoutButton.tsx
 *
 * Tombol logout — memanggil logoutAction (Server Action).
 * Clear session + redirect ke homepage (USER_FLOWS 2.3).
 */

import { useTransition } from "react";
import { logoutAction } from "@/lib/auth/actions";

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
      await logoutAction();
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
