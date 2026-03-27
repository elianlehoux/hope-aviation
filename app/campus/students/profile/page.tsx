/**
 * Profile settings — maps to profiles (and optional avatar upload).
 */
export default function StudentProfilePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Read/update <code className="text-xs">profiles</code> where{" "}
        <code className="text-xs">id</code> equals <code className="text-xs">auth.uid()</code>.
        Fields: <code className="text-xs">first_name</code>,{" "}
        <code className="text-xs">last_name</code>, <code className="text-xs">email</code>,{" "}
        <code className="text-xs">phone</code>, <code className="text-xs">bio</code>,{" "}
        <code className="text-xs">avatar_url</code>, <code className="text-xs">country_code</code>,{" "}
        <code className="text-xs">birth_date</code>.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Form bound to Supabase row here.
      </div>
    </div>
  );
}
