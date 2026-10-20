import { Suspense } from "react";
import { CampusDashboard } from "./campus-dashboard";

export default function CampusDashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <CampusDashboard />
    </Suspense>
  );
}

function DashboardFallback() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-primary/10" />
      <div className="h-24 animate-pulse rounded-2xl bg-primary/5" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 animate-pulse rounded-2xl bg-primary/5" />
        <div className="h-40 animate-pulse rounded-2xl bg-primary/5" />
        <div className="h-40 animate-pulse rounded-2xl bg-primary/5" />
      </div>
    </div>
  );
}
