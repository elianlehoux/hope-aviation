"use client";

import { useEffect, useState } from "react";

/**
 * Renders the copyright year dynamically on the client.
 * Isolated as a client component and uses useEffect because `new Date()` 
 * is not allowed during Server Component or Client Component pre-rendering 
 * under Next.js 16 PPR rules without a Suspense boundary.
 */
export function CopyrightYear() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <p>© {year} Hope Aviation.</p>;
}
