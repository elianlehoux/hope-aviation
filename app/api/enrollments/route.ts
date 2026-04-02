import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { parseUuidParam } from "@/lib/api/params";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const { searchParams } = new URL(request.url);
  const courseIdRaw = searchParams.get("course_id");
  const status = searchParams.get("status");
  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");

  let courseId: string | null = null;
  if (courseIdRaw) {
    const parsed = parseUuidParam(courseIdRaw);
    if (!parsed) {
      return jsonError("validation_error", "Invalid course_id.", 400);
    }
    courseId = parsed;
  }

  if (status) {
    if (!["active", "completed", "cancelled"].includes(status)) {
      return jsonError("validation_error", "Invalid status filter.", 400);
    }
  }

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
    .from("enrollments")
    .select(
      "*, courses (*), profiles!enrollments_user_id_fkey (id, first_name, last_name, email)",
    )
    .order("enrolled_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ enrollments: data ?? [], limit, offset });
}
