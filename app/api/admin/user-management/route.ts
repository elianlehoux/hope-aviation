import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireSession } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function sanitizeSearch(raw: string): string {
  return raw.trim().slice(0, 100).replace(/[%_,]/g, "");
}

/**
 * NEW: API specifically for the "User Management" page.
 * Restricted to staff (admin/instructor) but does NOT expose role editing data.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  // New page is for staff (admins + instructors)
  const staff = await requireStaff(supabase, session.user.id);
  if (!staff.ok) return staff.response;

  const { searchParams } = new URL(request.url);
  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");
  const searchRaw = searchParams.get("search");

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

  // Simplified query: only Profile info, no roles_users
  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, email, avatar_url, created_at, is_active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

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
