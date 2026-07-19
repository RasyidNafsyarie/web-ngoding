import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ToastContainer } from "@/components/ui/Toast";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * M2-10: Layout shell — header / konten / footer
 * Digunakan sebagai wrapper halaman publik
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
