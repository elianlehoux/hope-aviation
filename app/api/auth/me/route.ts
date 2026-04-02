import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";

/**
 * Minimal auth identity (Supabase user id + email).
 * For editable profile fields use `GET` / `PATCH` `/api/me/profile`.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return jsonError("unauthorized", "Authentication required.", 401);
  }

  return jsonOk({ user: { id: user.id, email: user.email } });
}
