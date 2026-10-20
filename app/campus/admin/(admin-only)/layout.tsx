import { Suspense } from "react";
import { RequireRole } from "@/components/features/campus/RequireRole";

/**
 * Admin-only sections: user management, users, roles and newsletter.
 * The route group keeps URLs unchanged (e.g. `/campus/admin/users`).
 */
export default function AdminOnlyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <RequireRole roles={["admin"]}>{children}</RequireRole>
    </Suspense>
  );
}
