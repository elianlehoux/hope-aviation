import type { PostgrestError } from "@supabase/supabase-js";
import { jsonError } from "@/lib/api/json";
import type { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/lib/api/json";

/**
 * Maps PostgREST / Postgres errors to safe HTTP responses (no raw DB messages to clients).
 */
export function responseFromPostgrestError(
  err: PostgrestError,
): NextResponse<ApiErrorBody> {
  const code = err.code ?? "unknown";

  if (code === "PGRST116") {
    return jsonError("not_found", "Resource not found.", 404);
  }

  if (code === "23503") {
    return jsonError("invalid_reference", "Related record is missing or invalid.", 400);
  }

  if (code === "23505") {
    return jsonError("conflict", "A record with this data already exists.", 409);
  }

  if (code === "42501" || err.message?.includes("permission denied")) {
    return jsonError("forbidden", "You do not have permission for this action.", 403);
  }

  return jsonError("database_error", "Something went wrong. Please try again.", 500);
}
