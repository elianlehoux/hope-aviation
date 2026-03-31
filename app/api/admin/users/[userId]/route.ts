import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { adminProfilePatchSchema } from "@/lib/validation/admin";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { userId: rawId } = await context.params;
  const userId = parseUuidParam(rawId);
  if (!userId) {
    return jsonError("validation_error", "Invalid user id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      *,
      roles_users (
        role_id,
        assigned_at,
        roles (
          id,
          name,
          slug,
          description
        )
      )
    `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "User not found.", 404);
  }

  return jsonOk({ user: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { userId: rawId } = await context.params;
  const userId = parseUuidParam(rawId);
  if (!userId) {
    return jsonError("validation_error", "Invalid user id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = adminProfilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid profile payload.", 400);
  }

  const payload = parsed.data;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(payload.first_name !== undefined
        ? { first_name: payload.first_name }
        : {}),
      ...(payload.last_name !== undefined ? { last_name: payload.last_name } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
      ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
      ...(payload.avatar_url !== undefined
        ? { avatar_url: payload.avatar_url }
        : {}),
      ...(payload.country_code !== undefined
        ? { country_code: payload.country_code }
        : {}),
      ...(payload.birth_date !== undefined
        ? { birth_date: payload.birth_date }
        : {}),
      ...(payload.is_active !== undefined
        ? { is_active: payload.is_active }
        : {}),
    })
    .eq("id", userId)
    .select(
      `
      *,
      roles_users (
        role_id,
        assigned_at,
        roles (
          id,
          name,
          slug,
          description
        )
      )
    `,
    )
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "User not found.", 404);
  }

  return jsonOk({ user: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { userId: rawId } = await context.params;
  const userId = parseUuidParam(rawId);
  if (!userId) {
    return jsonError("validation_error", "Invalid user id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  if (userId === session.user.id) {
    return jsonError(
      "validation_error",
      "You cannot deactivate your own account.",
      400,
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId)
    .select(
      `
      *,
      roles_users (
        role_id,
        assigned_at,
        roles (
          id,
          name,
          slug,
          description
        )
      )
    `,
    )
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "User not found.", 404);
  }

  return jsonOk({ user: data });
}
