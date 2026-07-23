"use client";

import { useEffect } from "react";
import { Card, Button } from "@/components/ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <Card padding="p-8" className="bg-destructive/10">
        <div className="neo-badge w-fit mx-auto bg-destructive text-card-white mb-4">
          Admin Error
        </div>

        <h2 className="text-md sm:text-lg font-pixel tracking-wide text-ink mb-3">
          Gagal Memuat Data Admin
        </h2>

        <p className="text-xs font-bold text-ink/70 leading-relaxed mb-6">
          Terjadi kesalahan saat memproses data di Admin Panel. Silakan coba muat ulang halaman.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="
              w-full sm:w-auto px-5 py-2.5 border-2 border-ink rounded-lg bg-retro-green text-ink
              font-bold text-xs shadow-retro-sm hover:opacity-90 active:translate-x-[1px]
              active:translate-y-[1px] transition-all cursor-pointer
            "
          >
            🔄 Coba Lagi
          </button>
          <Button href="/admin" variant="outline" size="sm" className="w-full sm:w-auto">
            Kembali ke Dashboard Admin
          </Button>
        </div>
      </Card>
    </div>
  );
}
