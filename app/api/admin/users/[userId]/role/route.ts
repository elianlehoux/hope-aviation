import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { userRoleAssignSchema } from "@/lib/validation/admin";

type RouteContext = { params: Promise<{ userId: string }> };

export async function PUT(request: Request, context: RouteContext) {
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

  const parsed = userRoleAssignSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid role assignment payload.", 400);
  }

  const { error: rpcError } = await supabase.rpc("admin_set_user_role", {
    p_user_id: userId,
    p_role_id: parsed.data.roleId,
  });

  if (rpcError) {
    const msg = rpcError.message ?? "";
    if (msg.includes("forbidden")) {
      return jsonError("forbidden", "You do not have permission for this action.", 403);
    }
    if (msg.includes("not authenticated")) {
      return jsonError("unauthorized", "Authentication required.", 401);
    }
    if (msg.includes("profile not found")) {
      return jsonError("not_found", "User not found.", 404);
    }
    if (msg.includes("role not found")) {
      return jsonError("not_found", "Role not found.", 404);
    }
    return responseFromPostgrestError(rpcError);
  }

  const { data: user, error: fetchError } = await supabase
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

  if (fetchError) {
    return responseFromPostgrestError(fetchError);
  }

  if (!user) {
    return jsonError("not_found", "User not found.", 404);
  }

  return jsonOk({ user });
}
