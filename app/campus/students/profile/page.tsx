import { apiRoutes } from "@/lib/api/app-routes";

/**
 * Profile settings — use the session-scoped HTTP API (not direct Supabase from the browser for writes).
 */
export default function StudentProfilePage() {
  const getProfile = apiRoutes.meProfile();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        <strong className="text-foreground">GET / PATCH</strong>{" "}
        <code className="text-xs break-all">{getProfile}</code>
        — returns <code className="text-xs">{"{ data: { profile } }"}</code>. PATCH body: editable
        fields only (see <code className="text-xs">profileSelfPatchSchema</code>);{" "}
        <code className="text-xs">is_active</code> and email changes remain admin / auth flows.
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Identity only: <code className="text-xs break-all">{apiRoutes.authMe()}</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Form: load with GET, save with PATCH to the route above.
      </div>
    </div>
  );
}
