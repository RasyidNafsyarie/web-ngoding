import { MainLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui";

export default function Home() {
  return (
    <MainLayout>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative border-b-2 border-ink bg-sky-primary overflow-hidden min-h-[60vh] flex items-center">
        {/* Background grid texture */}
        <div
          className="absolute inset-0 bg-grid opacity-25 pointer-events-none"
          aria-hidden="true"
        />

        {/* Ambient floating pixel-art clouds decoration placeholder */}
        <div className="absolute top-8 left-10 animate-float opacity-75 pointer-events-none hidden md:block">
          <span className="text-white font-pixel text-xs bg-card-white border-2 border-ink rounded-full px-4 py-1.5 shadow-retro-sm">
            ☁️ 8-bit Clouds
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24 w-full">
          <div className="flex flex-col gap-8 max-w-3xl">
            {/* Badge */}
            <span className="neo-badge w-fit">✦ Platform Coding Indonesia</span>

            {/* Headline using pixel font */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-pixel leading-normal tracking-wide text-ink">
              Belajar Coding{" "}
              <span className="inline-block bg-retro-green px-4 py-1 border-2 border-ink rounded-lg shadow-retro-sm">
                Santai
              </span>
            </h1>

            <p className="text-base md:text-lg font-medium text-ink max-w-xl leading-relaxed">
              Platform belajar coding interaktif berbahasa Indonesia. HTML, CSS, JavaScript —
              semuanya bisa dipraktikkan langsung di browser dengan editor & console bawaan.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button href="/paths" variant="primary" size="md">
                Mulai Belajar →
              </Button>
              <Button href="/playground" variant="outline" size="md">
                Coba Playground
              </Button>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div
            className="absolute top-16 right-12 hidden lg:flex items-center justify-center w-28 h-28 border-2 border-ink rounded-xl bg-pond-green font-semibold text-2xl text-ink rotate-6 shadow-retro-md"
            aria-hidden="true"
          >
            &lt;/&gt;
          </div>
          <div
            className="absolute bottom-16 right-36 hidden lg:flex items-center justify-center w-20 h-20 border-2 border-ink rounded-xl bg-soft-green font-semibold text-xl text-ink -rotate-3 shadow-retro-md"
            aria-hidden="true"
          >
            &#123;&#125;
          </div>
        </div>
      </section>

      {/* ── Design System Preview ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-lg md:text-xl font-pixel tracking-wider text-ink">Design System</h2>
          <span className="neo-badge rotate-1">Preview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card demo */}
          <Card>
            <div className="border-b-2 border-ink -mx-6 -mt-6 mb-4 px-6 py-3 bg-pond-green rounded-t-[10px]">
              <h3 className="font-pixel text-[10px] tracking-wide text-ink">Retro Card</h3>
            </div>
            <p className="text-sm font-medium text-ink leading-relaxed">
              Menggunakan border 2px, radius 12px, serta hard shadow offset 3px yang lebih halus dan
              tenang.
            </p>
          </Card>

          {/* Buttons demo */}
          <Card>
            <div className="border-b-2 border-ink -mx-6 -mt-6 mb-4 px-6 py-3 bg-soft-green rounded-t-[10px]">
              <h3 className="font-pixel text-[10px] tracking-wide text-ink">Tombol</h3>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="primary" size="sm">
                Primary / Dark
              </Button>
              <Button variant="secondary" size="sm">
                Secondary / Green
              </Button>
              <Button variant="outline" size="sm">
                Outline / White
              </Button>
            </div>
          </Card>

          {/* Typography demo */}
          <Card>
            <div className="border-b-2 border-ink -mx-6 -mt-6 mb-4 px-6 py-3 bg-retro-green rounded-t-[10px]">
              <h3 className="font-pixel text-[10px] tracking-wide text-ink">Tipografi</h3>
            </div>
            <p className="font-pixel text-xs tracking-wider leading-relaxed text-ink">
              Press Start 2P
            </p>
            <p className="font-sans font-medium text-sm text-ink mt-3 leading-relaxed">
              Body text menggunakan Inter untuk kemudahan membaca di perangkat layar lebar.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Color Palette section ───────────────────────────────── */}
      <section className="border-y-2 border-ink bg-ink py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-sm md:text-base font-pixel tracking-widest text-card-white mb-8">
            Warna (Palette)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: "Sky Blue", hex: "#87CEEB", bg: "bg-[#87CEEB]", text: "text-ink" },
              { name: "Pond Green", hex: "#B8D8BA", bg: "bg-[#B8D8BA]", text: "text-ink" },
              { name: "Card White", hex: "#FAFAF5", bg: "bg-[#FAFAF5]", text: "text-ink" },
              { name: "Retro Green", hex: "#4ade80", bg: "bg-[#4ade80]", text: "text-ink" },
              { name: "Ink Black", hex: "#1a1a2e", bg: "bg-[#1a1a2e]", text: "text-white" },
            ].map((color) => (
              <div
                key={color.hex}
                className={`
                  ${color.bg} ${color.text}
                  border-2 border-ink p-4 aspect-square rounded-lg
                  flex flex-col justify-end
                `}
                style={{ boxShadow: "3px 3px 0px 0px var(--color-card-white)" }}
              >
                <p className="font-pixel text-[8px] uppercase tracking-wider mb-1">{color.name}</p>
                <p className="font-mono text-[10px] font-semibold opacity-80">{color.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
