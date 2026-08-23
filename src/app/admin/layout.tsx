import type { ReactNode } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { requireRole } from "@/lib/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Layouts do not necessarily re-run on every navigation, so each admin page
  // performs its own check as well. This one keeps the nav itself off-limits.
  await requireRole(["admin"]);

  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
