import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun Ngoding Santuy dan mulai belajar coding hari ini.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-sky-primary bg-grid">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </main>
  );
}

