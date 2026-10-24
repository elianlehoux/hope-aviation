import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * Exchanges the PKCE code (OAuth, sign-up confirmation, password recovery)
 * for a session and sets auth cookies.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only same-origin paths; anything else falls back to /campus.
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  // An expired or reused recovery link lands on the new-password page,
  // which shows the "link expired" state with a way to request another.
  if (next.startsWith("/auth/nueva-clave")) {
    return NextResponse.redirect(`${origin}/auth/nueva-clave?expired=1`);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=1`);
}

