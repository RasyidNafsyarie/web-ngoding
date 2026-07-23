"use client";

import { useEffect } from "react";
import { MainLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uncaught application error:", error);
  }, [error]);

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl px-6 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Card padding="p-8 sm:p-12" className="w-full bg-warning/15">
          <div className="neo-badge w-fit mx-auto bg-warning text-ink mb-6">Terjadi Kesalahan</div>

          <h1 className="text-lg sm:text-xl font-pixel tracking-wide text-ink mb-4 leading-relaxed">
            Ups! Ada Masalah Teknis
          </h1>

          <p className="text-xs sm:text-sm font-bold text-ink/70 leading-relaxed mb-8">
            Aplikasi mengalami kendala saat memuat halaman ini. Jangan khawatir, kamu bisa mencoba
            memuat ulang atau kembali ke halaman utama.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="
                w-full sm:w-auto px-6 py-3 border-2 border-ink rounded-lg bg-retro-green text-ink
                font-bold text-xs shadow-retro-sm hover:opacity-90 active:translate-x-[1px]
                active:translate-y-[1px] transition-all cursor-pointer
              "
            >
              🔄 Coba Lagi
            </button>
            <Button href="/" variant="outline" className="w-full sm:w-auto">
              🏠 Kembali ke Beranda
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
