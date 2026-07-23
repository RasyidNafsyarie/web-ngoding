import type { Metadata } from "next";
import { MainLayout } from "@/components/layout";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan platform Ngoding Santuy.",
};

export default function SyaratKetentuanPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-3">
          <span className="neo-badge w-fit bg-soft-green">Ketentuan</span>
          <h1 className="text-xl font-pixel tracking-wide text-ink">Syarat & Ketentuan</h1>
          <p className="text-xs text-ink/60 font-bold">Terakhir diperbarui: 23 Juli 2026</p>
        </div>

        <Card
          padding="p-6 sm:p-8"
          hoverable={false}
          className="flex flex-col gap-6 text-xs sm:text-sm text-ink leading-relaxed"
        >
          <section>
            <h2 className="font-pixel text-sm text-ink mb-2">1. Penerimaan Ketentuan</h2>
            <p className="font-medium text-ink/80">
              Dengan mengakses atau menggunakan platform Ngoding Santuy, kamu menyetujui untuk
              terikat oleh Syarat dan Ketentuan penggunaan layanan ini.
            </p>
          </section>

          <section>
            <h2 className="font-pixel text-sm text-ink mb-2">2. Penggunaan Layanan</h2>
            <p className="font-medium text-ink/80">
              Platform ini disediakan untuk tujuan pembelajaran materi pemrograman secara pribadi
              dan non-komersial. Dilarang keras menyalahgunakan editor playground untuk menjalankan
              skrip berbahaya atau aktivitas peretasan.
            </p>
          </section>

          <section>
            <h2 className="font-pixel text-sm text-ink mb-2">3. Hak Kekayaan Intelektual</h2>
            <p className="font-medium text-ink/80">
              Seluruh materi kurikulum, desain antarmuka, dan konten pembelajaran di platform
              Ngoding Santuy merupakan hak cipta yang dilindungi.
            </p>
          </section>

          <section>
            <h2 className="font-pixel text-sm text-ink mb-2">4. Perubahan Ketentuan</h2>
            <p className="font-medium text-ink/80">
              Kami berhak mengubah atau memperbarui syarat & ketentuan ini sewaktu-waktu demi
              peningkatan mutu layanan.
            </p>
          </section>
        </Card>
      </div>
    </MainLayout>
  );
}
