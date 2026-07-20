"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchItem {
  id: string;
  title: string;
  slug: string;
  pathTitle: string;
  pathSlug: string;
  content: string;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Referensi untuk deteksi klik luar dan fokus input
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ref untuk instansi FlexSearch dan data asli pencarian
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flexIndexRef = useRef<any>(null);
  const searchDataRef = useRef<SearchItem[]>([]);

  // 1. Memuat berkas indeks pencarian statis & menginisialisasi FlexSearch secara malas (lazy load)
  const initSearchIndex = async () => {
    if (flexIndexRef.current) return; // Sudah diinisialisasi

    setLoading(true);
    try {
      // Ambil berkas JSON indeks statis
      const response = await fetch("/search-index.json");
      if (!response.ok) {
        throw new Error("Gagal mengambil search-index.json");
      }
      const data = (await response.json()) as SearchItem[];
      searchDataRef.current = data;

      // Lazy import flexsearch untuk menghemat ukuran bundle awal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const FlexSearchModule = (await import("flexsearch")) as any;
      const FlexSearch = FlexSearchModule.default || FlexSearchModule;

      const docIndex = new FlexSearch.Document({
        tokenize: "forward",
        resolution: 9,
        suggest: true, // Toleransi typo
        document: {
          id: "id",
          index: ["title", "content", "pathTitle"],
          store: ["title", "slug", "pathTitle", "pathSlug"],
        },
      });

      // Masukkan data artikel terpublikasi ke dalam indeks FlexSearch
      data.forEach((item, index) => {
        docIndex.add({
          id: index,
          title: item.title,
          content: item.content,
          pathTitle: item.pathTitle,
          slug: item.slug,
          pathSlug: item.pathSlug,
        });
      });

      flexIndexRef.current = docIndex;
    } catch (error) {
      console.error("❌ Gagal menginisialisasi indeks pencarian:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Jalankan pencarian setiap kali query berubah
  useEffect(() => {
    if (!query.trim() || !flexIndexRef.current) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    // Lakukan pencarian di FlexSearch
    const searchResults = flexIndexRef.current.search(query, {
      limit: 10,
      enrich: true,
    });

    // Ratakan hasil (flattening) dari berbagai field pencarian (title, content, pathTitle)
    const tempResults: SearchItem[] = [];
    const seenIds = new Set<number>();

    if (searchResults && Array.isArray(searchResults)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      searchResults.forEach((fieldResult: any) => {
        if (fieldResult && Array.isArray(fieldResult.result)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fieldResult.result.forEach((item: any) => {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              // Ambil data asli dari cache searchDataRef
              const originalDoc = searchDataRef.current[item.id];
              if (originalDoc) {
                tempResults.push(originalDoc);
              }
            }
          });
        }
      });
    }

    // Mekanisme fallback fuzzy search (toleransi typo) menggunakan jarak Levenshtein jika FlexSearch tidak mengembalikan hasil
    if (tempResults.length === 0) {
      const cleanQuery = query.toLowerCase().trim();
      const queryWords = cleanQuery.split(/\s+/);

      searchDataRef.current.forEach((item) => {
        const titleLower = item.title.toLowerCase();
        const pathLower = item.pathTitle.toLowerCase();

        // 1. Cek pencarian substring sederhana
        const isSubstringMatch = titleLower.includes(cleanQuery) || pathLower.includes(cleanQuery);

        if (isSubstringMatch) {
          tempResults.push(item);
          return;
        }

        // 2. Cek toleransi typo (jarak Levenshtein) untuk kata >= 3 karakter
        const itemWords = [
          ...titleLower.split(/[^a-zA-Z0-9]+/),
          ...pathLower.split(/[^a-zA-Z0-9]+/),
        ].filter(Boolean);

        const hasTypoMatch = queryWords.some((qw) => {
          if (qw.length < 3) return false;
          return itemWords.some((iw) => {
            // Toleransi jarak maksimal: 2 untuk kata >= 4 karakter, 1 untuk kata 3 karakter
            const maxDist = qw.length >= 4 ? 2 : 1;
            const dist = getLevenshteinDistance(qw, iw);
            return dist <= maxDist;
          });
        });

        if (hasTypoMatch) {
          tempResults.push(item);
        }
      });
    }

    setResults(tempResults);
    setActiveIndex(tempResults.length > 0 ? 0 : -1);
  }, [query]);

  // 3. Menangani navigasi keyboard (Panah Atas, Panah Bawah, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        const selected = results[activeIndex];
        router.push(`/paths/${selected.pathSlug}/${selected.slug}`);
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // 4. Deteksi klik di luar komponen untuk menutup dropdown hasil
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Pencarian */}
      <div className="relative w-full">
        <label htmlFor="global-search" className="sr-only">
          Cari artikel atau jalur belajar
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
          ref={inputRef}
          id="global-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            initSearchIndex();
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "MEMUAT DATA..." : "CARI MATERI..."}
          disabled={loading}
          autoComplete="off"
          className="
            neo-input h-9 !pl-9 pr-4 text-xs w-full rounded-full border-2 border-ink
            placeholder:text-ink/40 placeholder:font-semibold placeholder:uppercase placeholder:tracking-wide
            bg-card-white text-ink
          "
        />
      </div>

      {/* Dropdown Hasil Pencarian (Claymorphic / Retro Style) */}
      {isOpen && query.trim() !== "" && (
        <div
          role="listbox"
          aria-label="Hasil pencarian"
          className="
            absolute left-0 right-0 top-full mt-2 z-[100]
            bg-card-white border-2 border-ink rounded-xl shadow-retro-md
            max-h-[320px] overflow-y-auto p-2 flex flex-col gap-1
          "
        >
          {results.length === 0 ? (
            <div className="p-3 text-center text-xs text-ink/50 italic">
              Tidak ada hasil yang cocok dengan pencarian Anda.
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <Link
                  key={item.id}
                  href={`/paths/${item.pathSlug}/${item.slug}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`
                    w-full text-left p-2.5 rounded-lg text-xs font-semibold
                    flex flex-col gap-0.5 border border-transparent transition-colors
                    ${
                      isSelected
                        ? "bg-soft-green/30 border-ink/20 text-ink scale-[1.01]"
                        : "text-ink hover:bg-soft-green/20"
                    }
                  `}
                >
                  <span className="text-[9px] uppercase tracking-widest text-ink/50 font-bold">
                    {item.pathTitle}
                  </span>
                  <span className="text-xs font-bold font-sans">{item.title}</span>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// Menghitung jarak edit Levenshtein antara dua kata untuk mengukur tingkat kemiripan (typo tolerance)
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Substitusi
          Math.min(
            matrix[i][j - 1] + 1, // Insersi
            matrix[i - 1][j] + 1, // Delesi
          ),
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
