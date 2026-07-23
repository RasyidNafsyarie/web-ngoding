import type { Metadata } from "next";
import { MainLayout } from "@/components/layout";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi dan perlindungan data pengguna di Ngoding Santuy.",
};

export default function KebijakanPrivasiPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 flex flex-col gap-3">
          <span className="neo-badge w-fit bg-soft-green">Privasi</span>
          <h1 className="text-xl font-pixel tracking-wide text-ink">Kebijakan Privasi</h1>
          <p className="text-xs text-ink/60 font-bold">Terakhir diperbarui: 23 Juli 2026</p>
        </div>

        <Card
          padding="p-6 sm:p-8"
          hoverable={false}
          className="flex flex-col gap-6 text-xs sm:text-sm text-ink leading-relaxed"
        >
          <section>
            <h2 className="font-pixel text-sm text-ink mb-2">1. Pengumpulan Informasi</h2>
            <p className="font-medium text-ink/80">
              Kami mengumpulkan informasi yang kamu berikan saat mendaftar akun, seperti
              nama/username, alamat email, dan kata sandi yang telah dienkripsi (hashing bcrypt).
              Jika kamu memilih login menggunakan OAuth (Google / GitHub), kami hanya menyimpan
              profil publik dasar dan email.
            </p>
          </section>

          <section>
            <h2 className="font-pixel text-sm text-ink mb-2">2. Penggunaan Data</h2>
            <p className="font-medium text-ink/80">
              Informasi pengguna hanya digunakan untuk mengautentikasi sesi login, mencatat progres
              penyelesaian modul pembelajaran, serta menghitung Experience Points (XP) pada profil
              pengguna.
            </p>
          </section>

          <section>
            <h2 className="font-pixel text-sm text-ink mb-2">3. Keamanan Data</h2>
            <p className="font-medium text-ink/80">
              Kami berkomitmen menjaga keamanan data pengguna dengan menerapkan standar enkripsi
              industri, proteksi sesi NextAuth.js, serta keamanan jaringan basis data Supabase
              PostgreSQL.
            </p>
          </section>

          <section>
            <h2 className="font-pixel text-sm text-ink mb-2">4. Hak Pengguna</h2>
            <p className="font-medium text-ink/80">
              Pengguna memiliki hak penuh untuk mengakses informasi profil, melihat progres belajar,
              atau mengajukan permintaan penghapusan akun kapan saja.
            </p>
          </section>
        </Card>
      </div>
    </MainLayout>
  );
}
