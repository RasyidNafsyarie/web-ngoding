import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AdminSidebar />
          <main className="flex-1 w-full min-w-0">{children}</main>
        </div>
      </div>
    </MainLayout>
  );
}
