/**
 * Returns `raw` only when it is a same-origin relative path ("/campus/..."),
 * otherwise `fallback`. Guards post-login and callback redirects against
 * open-redirect payloads such as "//evil.com", "/\evil" or "https://evil.com".
 */
export function safeNext(
  raw: string | null | undefined,
  fallback = "/campus",
): string {
  if (typeof raw !== "string" || raw.length === 0) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  // Browsers drop tabs/newlines and treat "\" as "/", which can turn
  // "/\t/evil.com" into "//evil.com". Reject them outright.
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return fallback;

  // Final check: resolving against a dummy origin must keep that origin.
  try {
    const base = "http://safe-next.invalid";
    const resolved = new URL(raw, base);
    if (resolved.origin !== base) return fallback;
  } catch {
    return fallback;
  }

  return raw;
}
