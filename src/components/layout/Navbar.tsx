"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/paths", label: "Learning Paths" },
  { href: "/playground", label: "Playground" },
];

/**
 * Neo-Brutalism Navbar (DESIGN.md)
 * - Logo: bordered box, accent bg, uppercase, black font
 * - Links: bold uppercase, hover → border + accent bg + hard shadow
 * - border-b-4 border-black sebagai pemisah
 * - Hamburger: bordered square dengan hard shadow
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200]
          focus:btn-neo-secondary focus:px-4 focus:py-2
        "
      >
        Langsung ke konten utama
      </a>

      <header className="sticky top-0 z-50 w-full border-b-2 border-ink bg-sky-primary">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3"
        >
          {/* Logo — bordered box dengan accent bg & pixel font */}
          <Link
            href="/"
            aria-label="Ngoding Santuy — Halaman Utama"
            className="
              inline-flex items-center gap-2 px-3 py-1.5
              border-2 border-ink font-pixel text-xs md:text-sm
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

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-4" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="
                    block px-2 py-1
                    font-semibold text-sm text-ink
                    hover:text-deep-black hover:underline decoration-2 underline-offset-4
                    transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink
                  "
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs">
            <SearchBar />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="
                hidden md:inline-flex items-center justify-center
                px-4 py-2 min-h-[40px] h-10
                border-2 border-ink font-semibold text-sm rounded-lg
                bg-card-white text-ink
                shadow-retro-sm
                hover:bg-soft-green
                active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed
                transition-all duration-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2
              "
            >
              Masuk
            </Link>

            <Link
              href="/register"
              className="btn-neo-primary hidden md:inline-flex px-4 py-2 text-sm min-h-[40px] h-10 items-center justify-center"
            >
              Daftar Gratis
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              className="
                flex md:hidden h-10 w-10 items-center justify-center
                border-2 border-ink rounded-lg
                bg-card-white text-ink
                shadow-retro-sm
                hover:bg-soft-green
                active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed
                transition-all duration-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2
              "
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t-2 border-ink bg-sky-primary px-6 py-5 flex flex-col gap-4"
          >
            {/* Mobile Search */}
            <SearchBar />

            {/* Mobile Links */}
            <ul role="list" className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="
                      block w-full px-4 py-2.5
                      border-2 border-ink font-semibold rounded-lg text-sm text-ink
                      bg-card-white
                      shadow-retro-sm
                      hover:bg-soft-green
                      active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed
                      transition-all duration-100
                    "
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex gap-3 pt-1">
              <Link href="/login" className="btn-neo-outline flex-1 text-center text-sm h-10 py-2">
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn-neo-primary flex-1 text-center text-sm h-10 py-2"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/* ── Search Bar ──────────────────────────────────────────────── */
function SearchBar() {
  return (
    <div className="relative w-full">
      <label htmlFor="global-search" className="sr-only">
        Cari artikel atau learning path
      </label>
      <div
        aria-hidden="true"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink/60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        id="global-search"
        type="search"
        placeholder="CARI MATERI..."
        autoComplete="off"
        className="
          neo-input h-9 !pl-9 pr-4 text-xs w-full rounded-full border-2 border-ink
          placeholder:text-ink/40 placeholder:font-semibold placeholder:uppercase placeholder:tracking-wide
        "
      />
    </div>
  );
}
