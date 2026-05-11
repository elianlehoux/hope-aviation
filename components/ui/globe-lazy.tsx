"use client";

import dynamic from "next/dynamic";

/**
 * Client-side wrapper for lazy-loading the Globe component.
 * `ssr: false` requires a Client Component boundary in Next.js 16+.
 */
const Globe = dynamic(
  () => import("@/components/ui/globe").then((m) => m.Globe),
  {
    ssr: false,
    loading: () => <div className="w-full aspect-square" />,
  }
);

export { Globe as LazyGlobe };
