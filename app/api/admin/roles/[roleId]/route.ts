import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { PROTECTED_ROLE_SLUGS, roleUpdateSchema } from "@/lib/validation/admin";

type RouteContext = { params: Promise<{ roleId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { roleId: rawId } = await context.params;
  const roleId = parseUuidParam(rawId);
  if (!roleId) {
    return jsonError("validation_error", "Invalid role id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", roleId)
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Role not found.", 404);
  }

  return jsonOk({ role: data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { roleId: rawId } = await context.params;
  const roleId = parseUuidParam(rawId);
  if (!roleId) {
    return jsonError("validation_error", "Invalid role id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  const { data: existing, error: fetchErr } = await supabase
    .from("roles")
    .select("slug")
    .eq("id", roleId)
    .maybeSingle();

  if (fetchErr) {
    return responseFromPostgrestError(fetchErr);
  }

  if (!existing) {
    return jsonError("not_found", "Role not found.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid role payload.", 400);
  }

  const payload = parsed.data;

  const isProtected = (PROTECTED_ROLE_SLUGS as readonly string[]).includes(
    existing.slug,
  );
  if (
    isProtected &&
    payload.slug !== undefined &&
    payload.slug !== existing.slug
  ) {
    return jsonError(
      "validation_error",
      "Cannot change the slug of a built-in role.",
      400,
    );
  }

  const { data, error } = await supabase
    .from("roles")
    .update({
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
    })
    .eq("id", roleId)
    .select("*")
    .maybeSingle();

  if (error) {
    return responseFromPostgrestError(error);
  }

  if (!data) {
    return jsonError("not_found", "Role not found.", 404);
  }

  return jsonOk({ role: data });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { roleId: rawId } = await context.params;
  const roleId = parseUuidParam(rawId);
  if (!roleId) {
    return jsonError("validation_error", "Invalid role id.", 400);
  }

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  const { data: existing, error: fetchErr } = await supabase
    .from("roles")
    .select("slug")
    .eq("id", roleId)
    .maybeSingle();

  if (fetchErr) {
    return responseFromPostgrestError(fetchErr);
  }

  if (!existing) {
    return jsonError("not_found", "Role not found.", 404);
  }

  if ((PROTECTED_ROLE_SLUGS as readonly string[]).includes(existing.slug)) {
    return jsonError(
      "validation_error",
      "Cannot delete a built-in role.",
      400,
    );
  }

  const { data, error } = await supabase
    .from("roles")
    .delete()
    .eq("id", roleId)
    .select("id");

  if (error) {
    if (error.code === "23503") {
      return jsonError(
        "conflict",
        "This role is assigned to users and cannot be deleted.",
        409,
      );
    }
    return responseFromPostgrestError(error);
  }

  if (!data?.length) {
    return jsonError("not_found", "Role not found.", 404);
  }

  return new Response(null, { status: 204 });
}
