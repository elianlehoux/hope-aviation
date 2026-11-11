import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Email + password sign-in. Never creates accounts: sign-up lives in
 * /auth/registro and goes through Supabase's confirmation flow.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid login payload.", 400);
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // GoTrue only reports an unconfirmed email after the password matched,
    // so surfacing it does not reveal whether an address is registered.
    if (error?.code === "email_not_confirmed") {
      return jsonError("email_not_confirmed", "Email not confirmed.", 401);
    }
    return jsonError("invalid_credentials", "Invalid credentials.", 401);
  }

  // Deactivated accounts keep their data but may not sign in.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile && profile.is_active === false) {
    await supabase.auth.signOut();
    return jsonError("account_inactive", "This account is deactivated.", 403);
  }

  return jsonOk({
    user: { id: data.user.id, email: data.user.email },
  });
}
