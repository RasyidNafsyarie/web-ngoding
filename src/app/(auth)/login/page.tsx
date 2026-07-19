import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Ngoding Santuy kamu.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-sky-primary bg-grid">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}

