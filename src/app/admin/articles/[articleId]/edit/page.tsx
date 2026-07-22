"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdxEditorWithPreview } from "@/components/admin/MdxEditorWithPreview";

interface PathItem {
  id: string;
  title: string;
}

interface PageProps {
  params: Promise<{ articleId: string }>;
}

export default function AdminEditArticlePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.articleId;
  const router = useRouter();

  const [paths, setPaths] = useState<PathItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    learningPathId: "",
    title: "",
    slug: "",
    content: "",
    order: 1,
    isPublished: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pathsRes, articleRes] = await Promise.all([
          fetch("/api/admin/learning-paths"),
          fetch(`/api/admin/articles/${articleId}`),
        ]);

        const pathsJson = await pathsRes.json();
        const articleJson = await articleRes.json();

        if (pathsJson.success) setPaths(pathsJson.data);

        if (articleJson.success && articleJson.data) {
          const article = articleJson.data;
          setFormData({
            learningPathId: article.learningPathId,
            title: article.title,
            slug: article.slug,
            content: article.content,
            order: article.order,
            isPublished: article.isPublished,
          });
        } else {
          setErrorMsg("Artikel tidak ditemukan.");
        }
      } catch {
        setErrorMsg("Gagal memuat data artikel.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Gagal memperbarui artikel.");
      } else {
        router.push("/admin/articles");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center font-pixel text-xs text-ink/60">
        ⏳ Memuat data artikel...
      </div>
    );
  }

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
          <h1 className="font-pixel text-base sm:text-lg text-ink">✏️ Edit Artikel</h1>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="
            inline-flex items-center gap-2 px-5 py-2.5 w-fit
            border-2 border-ink bg-retro-green text-ink rounded-lg font-pixel text-xs
            shadow-retro-sm hover:bg-soft-green hover:-translate-x-[0.5px] hover:-translate-y-[0.5px]
            active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all disabled:opacity-50
          "
        >
          <span>{isSubmitting ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}</span>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Judul artikel"
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
              id="editIsPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
              className="w-5 h-5 accent-retro-green border-2 border-ink rounded cursor-pointer"
            />
            <label
              htmlFor="editIsPublished"
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
