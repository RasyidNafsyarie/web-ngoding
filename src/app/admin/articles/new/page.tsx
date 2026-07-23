"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const MdxEditorWithPreview = dynamic(
  () => import("@/components/admin/MdxEditorWithPreview").then((mod) => mod.MdxEditorWithPreview),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] w-full border-2 border-ink rounded-xl bg-card-white flex items-center justify-center font-bold text-ink/60">
        Memuat Editor MDX...
      </div>
    ),
  },
);

interface PathItem {
  id: string;
  title: string;
  slug: string;
}

export default function AdminNewArticlePage() {
  const router = useRouter();
  const [paths, setPaths] = useState<PathItem[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(true);

  const [formData, setFormData] = useState({
    learningPathId: "",
    title: "",
    slug: "",
    content: "# Judul Artikel\n\nTulis penjelasan materi di sini...\n",
    order: 1,
    isPublished: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await fetch("/api/admin/learning-paths");
        const json = await res.json();
        if (json.success) {
          setPaths(json.data);
          if (json.data.length > 0) {
            setFormData((prev) => ({ ...prev, learningPathId: json.data[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingPaths(false);
      }
    };
    fetchPaths();
  }, []);

  const handleTitleChange = (newTitle: string) => {
    const autoSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: autoSlug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Gagal membuat artikel.");
      } else {
        router.push("/admin/articles");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/articles"
              className="text-xs font-bold text-ink underline hover:text-retro-green"
            >
              ← Kembali ke Daftar Artikel
            </Link>
          </div>
          <h1 className="font-pixel text-base sm:text-lg text-ink">✍️ Tulis Artikel Baru</h1>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoadingPaths}
          className="
            inline-flex items-center gap-2 px-5 py-2.5 w-fit
            border-2 border-ink bg-retro-green text-ink rounded-lg font-pixel text-xs
            shadow-retro-sm hover:bg-soft-green hover:-translate-x-[0.5px] hover:-translate-y-[0.5px]
            active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all disabled:opacity-50
          "
        >
          <span>{isSubmitting ? "⏳ Menyimpan..." : "💾 Simpan Artikel"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 border-2 border-ink bg-destructive/10 text-destructive font-bold text-xs rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Form Metadata */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 border-2 border-ink bg-card-white rounded-xl shadow-retro-sm">
          {/* Select Learning Path */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink">Learning Path</label>
            <select
              required
              value={formData.learningPathId}
              onChange={(e) => setFormData((prev) => ({ ...prev, learningPathId: e.target.value }))}
              className="p-3 border-2 border-ink rounded-lg text-xs font-semibold bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink"
            >
              {paths.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-ink">Judul Artikel</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contoh: Pengenalan Tag HTML"
              className="p-3 border-2 border-ink rounded-lg text-xs font-sans bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink">Slug URL (Unik)</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="pengenalan-tag-html"
              className="p-3 border-2 border-ink rounded-lg text-xs font-mono bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {/* Order */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-ink">Urutan Artikel (#)</label>
            <input
              type="number"
              min={1}
              required
              value={formData.order}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 1 }))
              }
              className="p-3 border-2 border-ink rounded-lg text-xs font-mono bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
              className="w-5 h-5 accent-retro-green border-2 border-ink rounded cursor-pointer"
            />
            <label
              htmlFor="isPublished"
              className="text-xs font-bold text-ink cursor-pointer select-none"
            >
              Status Published (Tampilkan ke Publik)
            </label>
          </div>
        </div>

        {/* MDX Split Editor & Preview */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-ink">Konten Artikel (MDX)</label>
          <MdxEditorWithPreview
            value={formData.content}
            onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
          />
        </div>
      </form>
    </div>
  );
}
