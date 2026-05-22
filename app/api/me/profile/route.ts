import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { profileSelfPatchSchema } from "@/lib/validation/profile";

const PROFILE_SELECT =
  "id, first_name, last_name, email, phone, bio, avatar_url, country_code, birth_date, is_active, newsletter_opt_in, created_at, updated_at";

export async function GET() {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Profile not found.", 404);
  }

  return jsonOk({ profile: data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = profileSelfPatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid profile payload.", 400);
  }

  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) {
      updates[k] = v;
    }
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("validation_error", "No valid fields to update.", 400);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", session.user.id)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Profile not found.", 404);
  }

  return jsonOk({ profile: data });
}
