import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function sanitizeSearch(raw: string): string {
  return raw.trim().slice(0, 100).replace(/[%_,]/g, "");
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(request.url);
  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");
  const searchRaw = searchParams.get("search");
  const isActiveRaw = searchParams.get("is_active");

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

  let isActiveFilter: boolean | undefined;
  if (isActiveRaw === "true") isActiveFilter = true;
  else if (isActiveRaw === "false") isActiveFilter = false;

  let query = supabase
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
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (isActiveFilter !== undefined) {
    query = query.eq("is_active", isActiveFilter);
  }

  const search = searchRaw ? sanitizeSearch(searchRaw) : "";
  if (search.length > 0) {
    const pattern = `%${search}%`;
    query = query.or(
      `email.ilike.${pattern},first_name.ilike.${pattern},last_name.ilike.${pattern}`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return responseFromPostgrestError(error);
  }

  return jsonOk({ users: data ?? [], limit, offset });
}
