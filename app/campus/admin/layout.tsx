import { Suspense } from "react";
import { RequireRole } from "@/components/features/campus/RequireRole";

/**
 * Staff area guard — admins and instructors only.
 * Admin-only sections (users, roles, newsletter) add a stricter guard in `(admin-only)/layout.tsx`.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <RequireRole roles={["admin", "instructor"]}>{children}</RequireRole>
    </Suspense>
  );
}
