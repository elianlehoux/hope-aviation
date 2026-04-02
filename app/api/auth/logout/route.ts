import { createClient } from "@/lib/supabase/server";
import { jsonOk } from "@/lib/api/json";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return jsonOk({ signedOut: true });
}
