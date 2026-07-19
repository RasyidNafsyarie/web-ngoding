import Link from "next/link";

const footerLinks = {
  Belajar: [
    { href: "/paths", label: "Learning Paths" },
    { href: "/playground", label: "Playground" },
  ],
  Platform: [
    { href: "/tentang", label: "Tentang Kami" },
    { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
    { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
  ],
};

/**
 * Neo-Brutalism Footer (DESIGN.md)
 * - bg-neo-secondary (yellow) — color blocking sebagai section anchor
 * - border-t-4 border-black
 * - Links: bordered hover dengan hard shadow
 * - Typography: uppercase, font-black
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto w-full border-t-2 border-ink bg-card-white"
      aria-label="Footer situs"
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              aria-label="Ngoding Santuy — Halaman Utama"
              className="
                inline-flex w-fit items-center gap-2 px-3 py-1.5
                border-2 border-ink font-pixel text-xs
                bg-retro-green text-ink rounded-lg
                shadow-retro-sm
                hover:shadow-retro-md hover:-translate-x-[0.5px] hover:-translate-y-[0.5px]
                active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed
                transition-all duration-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2
              "
            >
              ✦ Ngoding Santuy
            </Link>
            <p className="text-sm font-medium text-ink max-w-[240px] leading-relaxed">
              Belajar coding santai, interaktif, dan berbahasa Indonesia.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-4">
              <h3 className="font-semibold text-xs uppercase tracking-widest text-ink/75 border-b border-container pb-2">
                {group}
              </h3>
              <ul role="list" className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="
                        inline-block font-medium text-sm text-ink/80
                        hover:text-retro-green hover:underline decoration-2 underline-offset-4
                        transition-all duration-100
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink
                      "
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted">
            © {year} Ngoding Santuy. Dibuat dengan ♥ untuk pelajar Indonesia.
          </p>
          <p className="text-xs font-medium text-muted">
            Built with{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="
                underline decoration-2 underline-offset-2 hover:text-retro-green
                transition-all duration-100
              "
            >
              Next.js
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

