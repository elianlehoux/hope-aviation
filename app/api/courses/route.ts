import { createClient } from "@/lib/supabase/server";
import { requireSession, requireStaff } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";
import { courseCreateSchema } from "@/lib/validation/academic";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");

  let limit = DEFAULT_LIMIT;
  if (limitRaw) {
    const n = Number.parseInt(limitRaw, 10);
    if (!Number.isFinite(n) || n < 1) {
      return jsonError("validation_error", "Invalid limit.", 400);
    }
    limit = Math.min(n, MAX_LIMIT);
  }

  let offset = 0;
  if (offsetRaw) {
    const n = Number.parseInt(offsetRaw, 10);
    if (!Number.isFinite(n) || n < 0) {
      return jsonError("validation_error", "Invalid offset.", 400);
    }
    offset = n;
  }

  let query = supabase
    .from("courses")
    .select("*, subjects(count)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    if (!["draft", "published", "archived"].includes(status)) {
      return jsonError("validation_error", "Invalid status filter.", 400);
    }
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ courses: data ?? [], limit, offset });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = courseCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid course payload.", 400);
  }

  const payload = parsed.data;

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: payload.title,
      description: payload.description ?? null,
      thumbnail_url: payload.thumbnail_url ?? null,
      status: payload.status,
    })
    .select("*")
    .single();

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ course: data }, 201);
}
