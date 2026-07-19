"use client";

/**
 * src/components/auth/SessionProvider.tsx
 *
 * Wrapper SessionProvider dari next-auth/react.
 * Diperlukan agar useSession() dapat dipakai di Client Components.
 */

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
