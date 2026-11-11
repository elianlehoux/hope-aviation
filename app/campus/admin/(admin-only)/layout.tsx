import { Suspense } from "react";
import { RequireRole } from "@/components/features/campus/RequireRole";

/**
 * Admin-only sections (currently the newsletter). People lives outside this group
 * because instructors can browse it too; its account controls are admin-only.
 * The route group keeps URLs unchanged (e.g. `/campus/admin/newsletter`).
 */
export default function AdminOnlyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <RequireRole roles={["admin"]}>{children}</RequireRole>
    </Suspense>
  );
}
