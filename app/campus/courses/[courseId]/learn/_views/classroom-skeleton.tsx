/** Placeholder with the classroom's shape while the outline loads. */
export function ClassroomSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-paper">
      <div className="h-14 border-b border-primary/10" />
      <div className="mx-auto max-w-[46rem] space-y-4 px-5 pt-12">
        <div className="h-4 w-40 animate-pulse rounded bg-primary/10" />
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-primary/10" />
        <div className="h-64 animate-pulse rounded-2xl bg-primary/5" />
      </div>
    </div>
  );
}
