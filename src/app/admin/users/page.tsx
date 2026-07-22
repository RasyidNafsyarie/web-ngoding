"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  totalXp: number;
  createdAt: string;
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Role Toggle State
  const [roleModalUser, setRoleModalUser] = useState<UserItem | null>(null);
  const [targetRole, setTargetRole] = useState<"USER" | "ADMIN">("USER");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const fetchUsers = useCallback(async (page: number) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&pageSize=10`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setPagination(json.pagination);
      } else {
        setErrorMsg(json.error?.message || "Gagal memuat pengguna.");
      }
    } catch {
      setErrorMsg("Koneksi gagal saat mengambil data pengguna.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/users?page=1&pageSize=10")
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          if (json.success) {
            setUsers(json.data);
            setPagination(json.pagination);
          } else {
            setErrorMsg(json.error?.message || "Gagal memuat pengguna.");
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setErrorMsg("Koneksi gagal saat mengambil data pengguna.");
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOpenRoleModal = (user: UserItem) => {
    setRoleModalUser(user);
    setTargetRole(user.role === "ADMIN" ? "USER" : "ADMIN");
  };

  const handleUpdateRole = async () => {
    if (!roleModalUser) return;
    setIsUpdatingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${roleModalUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      const json = await res.json();
      if (json.success) {
        setRoleModalUser(null);
        fetchUsers(pagination.currentPage);
      } else {
        alert(json.error?.message || "Gagal mengubah role.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <h1 className="font-pixel text-base sm:text-lg text-ink">👥 Daftar Pengguna</h1>
          <p className="text-xs text-ink/70 font-semibold mt-1">
            Lihat riwayat akun terdaftar dan kelola perizinan role (USER / ADMIN).
          </p>
        </div>
        <div className="neo-badge bg-pond-green text-xs font-pixel">
          Total: {pagination.totalItems} User
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 border-2 border-ink bg-destructive/10 text-destructive font-bold text-xs rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Users Table Card */}
      {isLoading ? (
        <div className="py-16 text-center font-pixel text-xs text-ink/60">⏳ Memuat data...</div>
      ) : users.length === 0 ? (
        <Card padding="p-12" hoverable={false} className="text-center bg-card-white">
          <span className="text-3xl mb-2 block">👥</span>
          <h3 className="font-pixel text-xs text-ink">Belum Ada Pengguna</h3>
        </Card>
      ) : (
        <Card
          padding="p-0"
          hoverable={false}
          className="bg-card-white border-2 border-ink overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-container/40 border-b-2 border-ink text-xs font-pixel text-ink uppercase">
                  <th className="p-4">Pengguna</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Total XP</th>
                  <th className="p-4">Terdaftar</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/20 text-xs font-sans">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-pond-green/10 transition-colors">
                    <td className="p-4 font-bold text-ink flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-ink bg-retro-green/40 flex items-center justify-center font-pixel text-xs shrink-0">
                        {u.name ? u.name[0].toUpperCase() : "U"}
                      </div>
                      <span>{u.name || "Tanpa Nama"}</span>
                    </td>
                    <td className="p-4 font-mono text-ink/80">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`neo-badge text-[9px] font-pixel ${
                          u.role === "ADMIN" ? "bg-retro-green text-ink" : "bg-sky-primary text-ink"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-pixel text-xs text-ink">
                      {u.role === "ADMIN" ? "0 XP" : `⚡ ${u.totalXp}`}
                    </td>
                    <td className="p-4 text-ink/60">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenRoleModal(u)}
                        className="px-3 py-1 border border-ink bg-card-white text-ink text-xs font-bold rounded hover:bg-soft-green transition-colors cursor-pointer"
                      >
                        Ubah Role 🔄
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-container/20 border-t-2 border-ink">
            <span className="text-xs font-semibold text-ink/70">
              Halaman {pagination.currentPage} dari {pagination.totalPages} ({pagination.totalItems}{" "}
              total user)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.currentPage <= 1}
                onClick={() => fetchUsers(pagination.currentPage - 1)}
                className="px-3 py-1.5 border-2 border-ink rounded-lg bg-card-white text-ink text-xs font-bold disabled:opacity-40 hover:bg-soft-green cursor-pointer"
              >
                ← Sebelumnya
              </button>
              <button
                type="button"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => fetchUsers(pagination.currentPage + 1)}
                className="px-3 py-1.5 border-2 border-ink rounded-lg bg-card-white text-ink text-xs font-bold disabled:opacity-40 hover:bg-soft-green cursor-pointer"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Modal Ubah Role ── */}
      {roleModalUser && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="w-full max-w-md border-4 border-ink bg-card-white rounded-2xl p-6 shadow-retro-lg flex flex-col gap-5">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <h3 className="font-pixel text-xs sm:text-sm text-ink uppercase">
                🔄 Ubah Role User
              </h3>
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="text-lg font-bold text-ink hover:opacity-70 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-ink font-semibold">
              <p>
                Anda akan mengubah role akun{" "}
                <strong>&quot;{roleModalUser.name || roleModalUser.email}&quot;</strong>.
              </p>
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-bold text-ink">Pilih Role Baru:</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as "USER" | "ADMIN")}
                  className="p-3 border-2 border-ink rounded-lg text-xs font-pixel bg-container/20 focus:outline-none"
                >
                  <option value="USER">USER (Pembelajar biasa, dapat XP)</option>
                  <option value="ADMIN">ADMIN (Pengelola platform, 0 XP)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink/20">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 border-2 border-ink rounded-lg bg-card-white text-ink text-xs font-bold hover:bg-container/50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isUpdatingRole}
                onClick={handleUpdateRole}
                className="px-5 py-2 border-2 border-ink rounded-lg bg-retro-green text-ink text-xs font-bold shadow-retro-sm hover:bg-soft-green cursor-pointer disabled:opacity-50"
              >
                {isUpdatingRole ? "Menyimpan..." : "Simpan Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
