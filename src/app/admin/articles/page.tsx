"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface ArticleItem {
  id: string;
  learningPathId: string;
  title: string;
  slug: string;
  order: number;
  isPublished: boolean;
  learningPath: {
    title: string;
    slug: string;
  };
}

interface PathItem {
  id: string;
  title: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [paths, setPaths] = useState<PathItem[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reorder State
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [reorderItems, setReorderItems] = useState<ArticleItem[]>([]);
  const [isSavingReorder, setIsSavingReorder] = useState(false);

  // Delete State
  const [deletingArticle, setDeletingArticle] = useState<ArticleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticles = useCallback(async () => {
    setErrorMsg(null);
    try {
      const query = selectedPathId ? `?learningPathId=${selectedPathId}` : "";
      const res = await fetch(`/api/admin/articles${query}`);
      const json = await res.json();
      if (json.success) {
        setArticles(json.data);
      } else {
        setErrorMsg(json.error?.message || "Gagal memuat artikel.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPathId]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/learning-paths")
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success) setPaths(json.data);
      })
      .catch((err) => console.error(err));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const query = selectedPathId ? `?learningPathId=${selectedPathId}` : "";
    fetch(`/api/admin/articles${query}`)
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          if (json.success) setArticles(json.data);
          else setErrorMsg(json.error?.message || "Gagal memuat artikel.");
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMsg("Terjadi kesalahan koneksi.");
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedPathId]);

  const handleTogglePublish = async (article: ArticleItem) => {
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !article.isPublished }),
      });
      const json = await res.json();
      if (json.success) {
        fetchArticles();
      } else {
        alert(json.error?.message || "Gagal mengubah status publikasi.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  const handleOpenReorderModal = () => {
    if (!selectedPathId) {
      alert("Pilih satu Learning Path terlebih dahulu untuk mengubah urutan artikel.");
      return;
    }
    const filtered = articles.filter((a) => a.learningPathId === selectedPathId);
    setReorderItems([...filtered].sort((a, b) => a.order - b.order));
    setIsReorderOpen(true);
  };

  const moveReorderItem = (index: number, direction: "up" | "down") => {
    const newItems = [...reorderItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setReorderItems(newItems);
  };

  const handleSaveReorder = async () => {
    setIsSavingReorder(true);
    try {
      const itemsPayload = reorderItems.map((item, idx) => ({
        id: item.id,
        order: idx + 1,
      }));

      const res = await fetch("/api/admin/articles/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload }),
      });

      const json = await res.json();
      if (json.success) {
        setIsReorderOpen(false);
        fetchArticles();
      } else {
        alert(json.error?.message || "Gagal menyimpan urutan.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSavingReorder(false);
    }
  };

  const handleDeleteArticleConfirm = async () => {
    if (!deletingArticle) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${deletingArticle.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setDeletingArticle(null);
        fetchArticles();
      } else {
        alert(json.error?.message || "Gagal menghapus artikel.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <h1 className="font-pixel text-base sm:text-lg text-ink">📝 Kelola Artikel</h1>
          <p className="text-xs text-ink/70 font-semibold mt-1">
            Pengelolaan konten artikel, reordering, dan status publikasi.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedPathId && (
            <button
              type="button"
              onClick={handleOpenReorderModal}
              className="
                px-3 py-2 border-2 border-ink bg-sky-primary/40 text-ink rounded-lg font-pixel text-xs
                shadow-retro-sm hover:bg-sky-primary cursor-pointer transition-all
              "
            >
              🔄 Ubah Urutan Artikel
            </button>
          )}
          <Link
            href="/admin/articles/new"
            className="
              px-4 py-2 border-2 border-ink bg-retro-green text-ink rounded-lg font-pixel text-xs
              shadow-retro-sm hover:bg-soft-green cursor-pointer transition-all
            "
          >
            ✍️ Tulis Artikel Baru
          </Link>
        </div>
      </div>

      {/* Filter by Learning Path */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-2 border-ink bg-card-white rounded-xl shadow-retro-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink">Filter Path:</span>
          <select
            value={selectedPathId}
            onChange={(e) => setSelectedPathId(e.target.value)}
            className="p-2 border-2 border-ink rounded-lg text-xs font-semibold bg-container/30 focus:outline-none"
          >
            <option value="">-- Semua Learning Paths --</option>
            {paths.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs font-bold text-ink/60">Total Artikel: {articles.length}</span>
      </div>

      {errorMsg && (
        <div className="p-4 border-2 border-ink bg-destructive/10 text-destructive font-bold text-xs rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* List Table / Cards Articles */}
      {isLoading ? (
        <div className="py-16 text-center font-pixel text-xs text-ink/60">⏳ Memuat data...</div>
      ) : articles.length === 0 ? (
        <Card padding="p-12" hoverable={false} className="text-center bg-card-white">
          <span className="text-3xl mb-2 block">📝</span>
          <h3 className="font-pixel text-xs text-ink">Belum Ada Artikel</h3>
          <p className="text-xs text-ink/60 mt-1">
            Klik tombol &quot;Tulis Artikel Baru&quot; untuk menambahkan modul.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((item) => (
            <Card
              key={item.id}
              padding="p-4 sm:p-5"
              hoverable={false}
              className="bg-card-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-ink"
            >
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="neo-badge bg-pond-green text-[9px]">
                    {item.learningPath.title}
                  </span>
                  <span className="neo-badge bg-container text-[9px] font-mono">
                    Urutan #{item.order}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    className={`neo-badge text-[9px] font-pixel cursor-pointer hover:opacity-80 transition-opacity ${
                      item.isPublished
                        ? "bg-retro-green text-ink"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {item.isPublished ? "✅ Published" : "🚫 Draft"}
                  </button>
                </div>
                <h3 className="font-pixel text-xs sm:text-sm text-ink truncate">{item.title}</h3>
                <span className="text-[11px] font-mono text-ink/60 truncate">
                  /paths/{item.learningPath.slug}/{item.slug}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0 border-t-2 sm:border-t-0 border-ink/10 pt-3 sm:pt-0">
                <Link
                  href={`/admin/articles/${item.id}/edit`}
                  className="px-3 py-1.5 border border-ink bg-card-white text-xs font-bold text-ink rounded hover:bg-soft-green transition-colors"
                >
                  Edit ✏️
                </Link>
                <button
                  type="button"
                  onClick={() => setDeletingArticle(item)}
                  className="px-3 py-1.5 border border-ink bg-destructive/10 text-xs font-bold text-destructive rounded hover:bg-destructive hover:text-card-white transition-colors cursor-pointer"
                >
                  Hapus 🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Modal Reorder Artikel ── */}
      {isReorderOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="w-full max-w-md border-4 border-ink bg-card-white rounded-2xl p-6 shadow-retro-lg flex flex-col gap-5">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <h3 className="font-pixel text-xs sm:text-sm text-ink uppercase">
                🔄 Reorder Artikel
              </h3>
              <button
                type="button"
                onClick={() => setIsReorderOpen(false)}
                className="text-lg font-bold text-ink hover:opacity-70 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
              {reorderItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border-2 border-ink bg-container/20 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-pixel text-xs text-ink/60">#{idx + 1}</span>
                    <span className="font-bold text-xs text-ink truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveReorderItem(idx, "up")}
                      className="px-2 py-1 border border-ink bg-card-white text-xs font-bold rounded hover:bg-pond-green disabled:opacity-30 cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === reorderItems.length - 1}
                      onClick={() => moveReorderItem(idx, "down")}
                      className="px-2 py-1 border border-ink bg-card-white text-xs font-bold rounded hover:bg-pond-green disabled:opacity-30 cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink/20">
              <button
                type="button"
                onClick={() => setIsReorderOpen(false)}
                className="px-4 py-2 border-2 border-ink rounded-lg bg-card-white text-ink text-xs font-bold hover:bg-container/50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingReorder}
                onClick={handleSaveReorder}
                className="px-5 py-2 border-2 border-ink rounded-lg bg-retro-green text-ink text-xs font-bold shadow-retro-sm hover:bg-soft-green cursor-pointer disabled:opacity-50"
              >
                {isSavingReorder ? "Menyimpan..." : "Simpan Urutan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus Artikel ── */}
      <ConfirmModal
        isOpen={Boolean(deletingArticle)}
        title="Hapus Artikel"
        message={
          <>
            Apakah Anda yakin ingin menghapus artikel{" "}
            <strong>&quot;{deletingArticle?.title}&quot;</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </>
        }
        isLoading={isDeleting}
        onConfirm={handleDeleteArticleConfirm}
        onClose={() => setDeletingArticle(null)}
      />
    </div>
  );
}
