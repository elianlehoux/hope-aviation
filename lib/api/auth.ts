import type { SupabaseClient, User } from "@supabase/supabase-js";
import { jsonError } from "@/lib/api/json";
import type { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/lib/api/json";

const STAFF_SLUGS = ["admin", "instructor"] as const;

async function roleSlugsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ ok: true; slugs: Set<string> } | { ok: false }> {
  const { data: rows, error } = await supabase
    .from("roles_users")
    .select("roles(slug)")
    .eq("user_id", userId);

  if (error) {
    return { ok: false };
  }

  const slugs = new Set(
    (rows ?? [])
      .map((r) => {
        const rel = r.roles as { slug: string } | { slug: string }[] | null;
        if (Array.isArray(rel)) return rel[0]?.slug;
        return rel?.slug;
      })
      .filter((s): s is string => Boolean(s)),
  );

  return { ok: true, slugs };
}

/** True if the user has admin or instructor role. False if roles could not be loaded. */
export async function userIsStaff(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const r = await roleSlugsForUser(supabase, userId);
  if (!r.ok) return false;
  return STAFF_SLUGS.some((s) => r.slugs.has(s));
}

export type SessionResult =
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; response: NextResponse<ApiErrorBody> };

/**
 * Requires a signed-in user (401 if missing).
 */
export async function requireSession(
  supabase: SupabaseClient,
): Promise<SessionResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: jsonError("unauthorized", "Authentication required.", 401),
    };
  }

  return { ok: true, user, supabase };
}

/**
 * Requires admin or instructor role (403 otherwise). Use for mutating staff-only routes.
 */
export async function requireStaff(
  supabase: SupabaseClient,
  userId: string,
): Promise<
  | { ok: true }
  | { ok: false; response: NextResponse<ApiErrorBody> }
> {
  const r = await roleSlugsForUser(supabase, userId);
  if (!r.ok) {
    return {
      ok: false,
      response: jsonError("forbidden", "Could not verify your role.", 403),
    };
  }

  const isStaff = STAFF_SLUGS.some((s) => r.slugs.has(s));
  if (!isStaff) {
    return {
      ok: false,
      response: jsonError(
        "forbidden",
        "Only instructors and administrators can perform this action.",
        403,
      ),
    };
  }

  return { ok: true };
}

/**
 * Requires the `admin` role (403 otherwise). Use for admin-only routes (users, roles).
 */
export async function requireAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<
  | { ok: true }
  | { ok: false; response: NextResponse<ApiErrorBody> }
> {
  const { data: row, error } = await supabase
    .from("roles_users")
    .select("roles(slug)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      response: jsonError("forbidden", "Could not verify your role.", 403),
    };
  }

  const rel = row?.roles as { slug: string } | { slug: string }[] | null;
  const slug = Array.isArray(rel) ? rel[0]?.slug : rel?.slug;
  if (slug !== "admin") {
    return {
      ok: false,
      response: jsonError(
        "forbidden",
        "Only administrators can perform this action.",
        403,
      ),
    };
  }

  return { ok: true };
}
