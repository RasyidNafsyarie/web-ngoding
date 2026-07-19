/**
 * src/lib/auth/auth.ts
 *
 * Konfigurasi Auth.js v5 terpusat — satu-satunya file yang menyentuh NextAuth.
 * Import { auth, signIn, signOut, handlers } hanya dari sini.
 *
 * Provider:
 *   - Credentials (email + password bcrypt)
 *   - Google OAuth
 *   - GitHub OAuth
 *
 * Session strategy: JWT
 * Field tambahan di token/session: id, role (dari User.role di DB)
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/auth/validation";
import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

// ─── Tipe augmentation (M4-06) ────────────────────────────────────────────────
// Deklarasi ada di src/types/next-auth.d.ts

const config: NextAuthConfig = {
  // Isolasi adapter di satu tempat
  adapter: PrismaAdapter(prisma),

  // JWT strategy: tidak menyimpan session di DB, lebih ringan untuk serverless
  session: { strategy: "jwt" },

  // Custom pages — hindari default NextAuth UI
  pages: {
    signIn: "/login",
    error: "/login", // error param ditambahkan otomatis
  },

  providers: [
    // ── Credentials (email + password) ──────────────────────────────────────
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validasi input dengan Zod sebelum menyentuh DB (M4-12)
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Cari user di DB
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        // Cari Account credentials untuk ambil password hash
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "credentials",
          },
        });
        if (!account?.refresh_token) return null;

        // Verifikasi password dengan bcrypt
        const passwordValid = await bcrypt.compare(password, account.refresh_token);
        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // ── Google OAuth ─────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── GitHub OAuth ─────────────────────────────────────────────────────────
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // ── jwt callback: masukkan id & role ke token ────────────────────────────
    async jwt({ token, user, trigger, session }) {
      // `user` hanya tersedia saat pertama login
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role ?? "USER";
      }

      // Saat session di-update via useSession().update()
      if (trigger === "update" && session?.role) {
        token.role = session.role as Role;
      }

      // Role sudah ada di token dari login — tidak perlu re-query DB berkala
      // (JWT expired akan handle refresh, role di-download otomatis dari token)

      return token;
    },

    // ── session callback: expose id & role ke client ─────────────────────────
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },

    // ── signIn callback: set role USER untuk OAuth baru ──────────────────────
    async signIn({ user, account }) {
      // Untuk OAuth: pastikan user.role ter-set di DB
      // (Prisma Adapter create user tanpa role → default USER sudah di schema)
      if (account?.provider !== "credentials" && user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        // Inject role ke object user agar jwt callback menerimanya
        if (dbUser) {
          (user as { role?: Role }).role = dbUser.role;
        }
      }
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
