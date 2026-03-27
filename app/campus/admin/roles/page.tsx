/**
 * Role definitions — slug used in app logic (admin, instructor, student).
 */
export default function AdminRolesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        CRUD <code className="text-xs">roles</code>: <code className="text-xs">name</code>,{" "}
        <code className="text-xs">slug</code> (unique), <code className="text-xs">description</code>.
        Avoid renaming slugs once referenced in RLS policies.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Simple roles table UI here.
      </div>
    </div>
  );
}
