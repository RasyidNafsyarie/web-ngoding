<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Aturan Tambahan Asisten (Antigravity)

1. **Commit Git di Akhir Percakapan:**
   Setiap kali selesai membuat fitur baru, memodifikasi kode, atau memperbaiki error, asisten wajib:

   - Menjalankan ketiga perintah verifikasi ini **secara berurutan** sebelum commit:
     ```bash
     npm run format      # Merapikan gaya penulisan kode (Prettier) — WAJIB dijalankan
     npm run lint        # Memeriksa kebersihan penulisan kode (ESLint)
     npm run type-check  # Memeriksa kebenaran tipe data (TypeScript compiler)
     ```
   - Memastikan **ketiga perintah di atas lulus 100% tanpa error maupun warning** sebelum merekomendasikan commit.
   - Menyajikan perintah `git commit` yang sesuai dengan perubahan yang dilakukan.

   > **Catatan penting:** `npm run format` wajib dijalankan terhadap **semua file yang dibuat atau dimodifikasi**, termasuk file konfigurasi seperti `AGENTS.md`, `*.yml`, `*.json`, dan file teks lainnya — bukan hanya file `.ts`/`.tsx`. Gagal menjalankan `format` sebelum commit adalah penyebab utama CI gagal di tahap Prettier check.
