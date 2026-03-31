import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { roleCreateSchema } from "@/lib/validation/admin";

export async function GET() {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("slug", { ascending: true });

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ roles: data ?? [] });
}

export async function POST(request: Request) {
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

  const parsed = roleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid role payload.", 400);
  }

  const payload = parsed.data;

  const { data, error } = await supabase
    .from("roles")
    .insert({
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ role: data }, 201);
}
