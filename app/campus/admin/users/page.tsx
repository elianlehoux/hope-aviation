/**
 * User administration — profiles and role assignments.
 */
export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Users</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Manage <code className="text-xs">profiles</code> and assign rows in{" "}
        <code className="text-xs">roles_users</code> (<code className="text-xs">user_id</code>,{" "}
        <code className="text-xs">role_id</code>). Keep <code className="text-xs">profiles.id</code> in
        sync with Supabase Auth.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Searchable user table + role multi-select here.
      </div>
    </div>
  );
}
