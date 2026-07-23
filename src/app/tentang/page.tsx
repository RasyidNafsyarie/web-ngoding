import type { Metadata } from "next";
import { MainLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Mengenal platform Ngoding Santuy — tempat belajar coding santai, interaktif, dan berbahasa Indonesia.",
};

export default function TentangPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-4">
          <span className="neo-badge w-fit bg-soft-green">Tentang Platform</span>
          <h1 className="text-xl sm:text-2xl font-pixel tracking-wide text-ink leading-snug">
            Ngoding Santuy
          </h1>
          <p className="text-xs sm:text-sm font-bold text-ink/80 leading-relaxed">
            Platform pembelajaran pemrograman web gratis, interaktif, dan terstruktur yang dirancang
            khusus dengan Bahasa Indonesia agar siapa saja dapat belajar ngoding dengan santai.
          </p>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-8">
          <Card padding="p-6 sm:p-8" hoverable={false}>
            <h2 className="text-md font-pixel text-ink mb-4">🎯 Visi & Misi</h2>
            <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium mb-4">
              Kami percaya bahwa mempelajari teknologi dan ilmu pemrogramannya tidak harus rumit dan
              membosankan. Ngoding Santuy hadir untuk memangkas hambatan bahasa dan menyediakan
              pengalaman belajar langsung (*hands-on*) langsung di dalam browser tanpa perlu install
              software yang kompleks.
            </p>
          </Card>

          <Card padding="p-6 sm:p-8" hoverable={false} className="bg-pond-green/10">
            <h2 className="text-md font-pixel text-ink mb-4">✨ Keunggulan Platform</h2>
            <ul className="flex flex-col gap-3 text-xs sm:text-sm text-ink font-medium list-disc pl-5">
              <li>
                <strong>Kurikulum Terstruktur:</strong> Materi disusun bertahap mulai dari HTML
                Dasar, CSS Styling, hingga JavaScript Interaktif.
              </li>
              <li>
                <strong>Interactive Playground:</strong> Coba dan jalankan kode HTML/CSS/JS secara
                langsung di browser dengan hasil instant preview.
              </li>
              <li>
                <strong>Gamifikasi berbasis XP:</strong> Dapatkan Experience Points (XP) untuk
                setiap modul yang berhasil kamu selesaikan.
              </li>
              <li>
                <strong>100% Bahasa Indonesia:</strong> Seluruh penjelasan disajikan dalam bahasa
                yang ramah dan mudah dipahami oleh pemula.
              </li>
            </ul>
          </Card>

          <div className="flex justify-center mt-4">
            <Button href="/paths" variant="primary" size="lg">
              🚀 Mulai Belajar Sekarang
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
