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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return jsonError("unauthorized", "Invalid credentials.", 401);
  }

  return jsonOk({
    user: { id: data.user.id, email: data.user.email },
  });
}
