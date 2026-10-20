import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";
import {
  isCampusPreviewEnabled,
  parsePreviewRole,
  previewCredentials,
  PREVIEW_COOKIE,
  type PreviewRole,
} from "@/lib/dev/campus-preview";

function previewDisabled() {
  return jsonError("not_found", "Not found.", 404);
}

function cookieOptions() {
  return {
    name: PREVIEW_COOKIE,
    path: "/",
    httpOnly: false,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  };
}

async function signInAsRole(role: PreviewRole) {
  const { email, password } = previewCredentials(role);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { ok: false as const, message: error?.message || "Preview sign-in failed." };
  }
  return { ok: true as const, user: data.user };
}

export async function GET(request: NextRequest) {
  if (!isCampusPreviewEnabled()) return previewDisabled();

  const role = parsePreviewRole(request.nextUrl.searchParams.get("role")) ?? "student";
  const nextRaw = request.nextUrl.searchParams.get("next") || "/campus";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/campus";

  const result = await signInAsRole(role);
  if (!result.ok) {
    return jsonError("unauthorized", result.message, 401);
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set({ ...cookieOptions(), value: role });
  return response;
}

export async function POST(request: Request) {
  if (!isCampusPreviewEnabled()) return previewDisabled();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const role = parsePreviewRole(
    typeof body === "object" && body && "role" in body
      ? String((body as { role: unknown }).role)
      : null,
  );
  if (!role) {
    return jsonError("validation_error", "Invalid role.", 400);
  }

  const result = await signInAsRole(role);
  if (!result.ok) {
    return jsonError("unauthorized", result.message, 401);
  }

  const response = jsonOk({
    role,
    user: { id: result.user.id, email: result.user.email },
  });
  response.cookies.set({ ...cookieOptions(), value: role });
  return response;
}
