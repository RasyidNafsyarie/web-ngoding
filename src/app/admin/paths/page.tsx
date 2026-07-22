"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

interface LearningPathItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  articleCount: number;
  createdAt: string;
}

export default function AdminLearningPathsPage() {
  const [paths, setPaths] = useState<LearningPathItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPathItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingPath, setDeletingPath] = useState<LearningPathItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPaths = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/learning-paths");
      const json = await res.json();
      if (json.success) {
        setPaths(json.data);
      } else {
        setErrorMsg(json.error?.message || "Gagal memuat data.");
      }
    } catch {
      setErrorMsg("Koneksi gagal saat mengambil data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/learning-paths")
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          if (json.success) setPaths(json.data);
          else setErrorMsg(json.error?.message || "Gagal memuat data.");
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMsg("Koneksi gagal saat mengambil data.");
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPath(null);
    setFormData({ title: "", slug: "", description: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: LearningPathItem) => {
    setEditingPath(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description,
      imageUrl: item.imageUrl ?? "",
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (newTitle: string) => {
    const autoSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: editingPath ? prev.slug : autoSlug,
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const url = editingPath
      ? `/api/admin/learning-paths/${editingPath.id}`
      : "/api/admin/learning-paths";
    const method = editingPath ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: formData.imageUrl.trim() ? formData.imageUrl.trim() : null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error?.message || "Gagal menyimpan Learning Path.");
      } else {
        setIsModalOpen(false);
        fetchPaths();
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPath) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/learning-paths/${deletingPath.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error?.message || "Gagal menghapus Learning Path.");
      } else {
        setDeletingPath(null);
        fetchPaths();
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <h1 className="font-pixel text-base sm:text-lg text-ink">🗺️ Kelola Learning Paths</h1>
          <p className="text-xs text-ink/70 font-semibold mt-1">
            Tambah, ubah, atau hapus jalur pembelajaran coding di platform.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="
            inline-flex items-center gap-2 px-4 py-2.5 w-fit
            border-2 border-ink bg-retro-green text-ink rounded-lg font-pixel text-xs
            shadow-retro-sm hover:bg-soft-green hover:-translate-x-[0.5px] hover:-translate-y-[0.5px]
            active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-all
          "
        >
          <span>➕ Tambah Path Baru</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 border-2 border-ink bg-destructive/10 text-destructive font-bold text-xs rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Grid List Learning Paths */}
      {isLoading ? (
        <div className="py-16 text-center font-pixel text-xs text-ink/60">⏳ Memuat data...</div>
      ) : paths.length === 0 ? (
        <Card padding="p-12" hoverable={false} className="text-center bg-card-white">
          <span className="text-3xl mb-2 block">🗺️</span>
          <h3 className="font-pixel text-xs text-ink">Belum Ada Learning Path</h3>
          <p className="text-xs text-ink/60 mt-1">
            Klik tombol di atas untuk menambah path pertama.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((item) => (
            <Card
              key={item.id}
              padding="p-6"
              hoverable={false}
              className="bg-card-white flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="neo-badge bg-pond-green text-[9px] uppercase">
                    slug: {item.slug}
                  </span>
                  <span className="neo-badge bg-sky-primary text-[9px]">
                    📚 {item.articleCount} Artikel
                  </span>
                </div>
                <h2 className="font-pixel text-sm text-ink">{item.title}</h2>
                <p className="text-xs text-ink/70 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-ink/20">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(item)}
                  className="px-3 py-1.5 border border-ink bg-card-white text-ink text-xs font-bold rounded hover:bg-soft-green transition-colors cursor-pointer"
                >
                  Edit ✏️
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingPath(item)}
                  className="px-3 py-1.5 border border-ink bg-destructive/10 text-destructive text-xs font-bold rounded hover:bg-destructive hover:text-card-white transition-colors cursor-pointer"
                >
                  Hapus 🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Modal Form Create / Edit ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="w-full max-w-lg border-4 border-ink bg-card-white rounded-2xl p-6 shadow-retro-lg flex flex-col gap-5">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <h3 className="font-pixel text-xs sm:text-sm text-ink uppercase">
                {editingPath ? "✏️ Edit Learning Path" : "➕ Tambah Learning Path"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-lg font-bold text-ink hover:opacity-70 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-ink">Judul Path</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Contoh: HTML Dasar"
                  className="p-3 border-2 border-ink rounded-lg text-xs font-sans bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-ink">Slug URL (Unik)</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="Contoh: html-dasar"
                  className="p-3 border-2 border-ink rounded-lg text-xs font-mono bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-ink">Deskripsi</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Deskripsi singkat seputar jalur belajar ini..."
                  className="p-3 border-2 border-ink rounded-lg text-xs font-sans bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-ink">URL Gambar / Cover (Opsional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/cover.png"
                  className="p-3 border-2 border-ink rounded-lg text-xs font-sans bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink/20 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border-2 border-ink rounded-lg bg-card-white text-ink text-xs font-bold hover:bg-container/50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 border-2 border-ink rounded-lg bg-retro-green text-ink text-xs font-bold shadow-retro-sm hover:bg-soft-green cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Path"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus ── */}
      <ConfirmModal
        isOpen={Boolean(deletingPath)}
        title="Hapus Learning Path"
        message={
          <>
            Apakah Anda yakin ingin menghapus <strong>&quot;{deletingPath?.title}&quot;</strong>?
            <br />
            <span className="text-destructive mt-1 block">
              ⚠️ Seluruh {deletingPath?.articleCount} artikel di dalam path ini akan ikut terhapus!
            </span>
          </>
        }
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingPath(null)}
      />
    </div>
  );
}
