import { MainLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl px-6 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Card padding="p-8 sm:p-12" className="w-full bg-pond-green/15">
          <div className="neo-badge w-fit mx-auto bg-destructive text-card-white mb-6">
            Error 404
          </div>

          <h1 className="text-xl sm:text-2xl font-pixel tracking-wide text-ink mb-4 leading-relaxed">
            Halaman Tidak Ditemukan
          </h1>

          <p className="text-xs sm:text-sm font-bold text-ink/70 leading-relaxed mb-8">
            Waduh! Halaman yang kamu cari mungkin telah dipindahkan, dihapus, atau belum dibuat.
            Mari kembali ke jalur belajar untuk melanjutkan aktivitas ngodingmu!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/paths" variant="primary" className="w-full sm:w-auto">
              📚 Jelajahi Jalur Belajar
            </Button>
            <Button href="/" variant="outline" className="w-full sm:w-auto">
              🏠 Kembali ke Beranda
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
