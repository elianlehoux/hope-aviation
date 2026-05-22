import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/json";

const subscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("validation_error", "Invalid email address.", 400);
  }

  const { email } = parsed.data;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("subscribe_to_newsletter", {
    p_email: email,
  });

  if (error) {
    console.error("Error executing subscribe_to_newsletter RPC:", error);
    return jsonError("database_error", "Failed to subscribe to the newsletter.", 500);
  }

  return jsonOk({ success: data });
}
