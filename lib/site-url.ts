/**
 * Canonical public origin, without a trailing slash: NEXT_PUBLIC_SITE_URL when set (production
 * should set https://hopeaviation.org), else the Vercel deployment URL, else local dev.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Production builds may be indexed; Vercel preview deployments and local dev stay out of search.
 * Hosts other than Vercel have no VERCEL_ENV and count as production.
 */
export function isIndexable(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  return process.env.NODE_ENV === "production" && (!vercelEnv || vercelEnv === "production");
}
