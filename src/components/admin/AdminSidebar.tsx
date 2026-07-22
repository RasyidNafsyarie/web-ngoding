"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/paths", label: "Learning Paths", icon: "🗺️" },
  { href: "/admin/articles", label: "Articles", icon: "📝" },
  { href: "/admin/users", label: "Users", icon: "👥" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
      <div className="border-2 border-ink bg-card-white rounded-xl p-5 shadow-retro-md flex flex-col gap-6">
        {/* Header Admin */}
        <div className="flex items-center justify-between border-b-2 border-ink pb-4">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-ink">🛠️ Panel Admin</span>
          </div>
          <span className="neo-badge bg-retro-green text-[9px] uppercase font-pixel">ADMIN</span>
        </div>

        {/* Navigation Menu */}
        <nav aria-label="Navigasi Admin">
          <ul className="flex flex-col gap-2" role="list">
            {adminNavLinks.map((link) => {
              const isActive =
                link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 border-ink font-semibold text-xs sm:text-sm
                      transition-all duration-100
                      ${
                        isActive
                          ? "bg-retro-green text-ink shadow-retro-sm translate-x-[1px] translate-y-[1px]"
                          : "bg-card-white text-ink hover:bg-pond-green/30 hover:shadow-retro-sm"
                      }
                    `}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to Public Platform Link */}
        <div className="pt-4 border-t-2 border-dashed border-ink/20">
          <Link
            href="/"
            className="
              flex items-center justify-center gap-2 w-full px-4 py-2.5
              border-2 border-ink bg-sky-primary/30 text-ink rounded-lg
              font-bold text-xs hover:bg-sky-primary/60 transition-colors
            "
          >
            <span>← Kembali ke Website</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
