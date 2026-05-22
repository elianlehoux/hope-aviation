import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

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

  // 1. Try to sign in with password first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData.user) {
    return jsonOk({
      user: { id: signInData.user.id, email: signInData.user.email },
      isNewUser: false,
    });
  }

  // 2. If sign-in failed, check if the account doesn't exist by trying to sign it up
  // If the user already exists, Supabase signUp will return an empty identities array (user enumeration protection)
  // or a "User already registered" error.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  // Check if it's a new user (identities array is not empty)
  const isNewUser = signUpData?.user && signUpData.user.identities && signUpData.user.identities.length > 0;

  if (!signUpError && isNewUser) {
    return jsonOk({
      user: { id: signUpData.user!.id, email: signUpData.user!.email },
      isNewUser: true,
      requiresConfirmation: !signUpData.session,
    });
  }

  // If signUp failed or user already existed (empty identities), return unauthorized (invalid credentials)
  return jsonError("unauthorized", "Invalid credentials.", 401);
}
