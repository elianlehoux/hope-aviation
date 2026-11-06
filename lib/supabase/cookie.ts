import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Auth cookie options shared by every Supabase client.
 *
 * The default cookie name comes from the first label of the Supabase host. Hosted projects get
 * their project ref ("sb-<ref>-auth-token"), but every local stack runs on 127.0.0.1, so all of
 * them share "sb-127-auth-token" and signing in to another local app replaces this one's session.
 * Local URLs therefore add the port; hosted projects keep the default name.
 */
export function authCookieOptions(): CookieOptionsWithName | undefined {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const local = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (!local) return undefined;
  return { name: `sb-${url.hostname.split(".")[0]}-${url.port || "80"}-auth-token` };
}
