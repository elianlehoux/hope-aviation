"use client";

/**
 * Renders the copyright year dynamically on the client.
 * Isolated as a client component because `new Date()` is not allowed
 * in Server Components under Next.js 16 PPR rules.
 */
export function CopyrightYear() {
  return <p suppressHydrationWarning>© {new Date().getFullYear()} Hope Aviation.</p>;
}
