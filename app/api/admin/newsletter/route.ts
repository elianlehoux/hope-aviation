import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSession } from "@/lib/api/auth";
import { jsonOk } from "@/lib/api/json";
import { responseFromPostgrestError } from "@/lib/api/supabase-errors";

export async function GET() {
  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  const admin = await requireAdmin(supabase, session.user.id);
  if (!admin.ok) return admin.response;

  // Get total subscribers count
  const { count: subscribersCount, error: subsError } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });

  if (subsError) {
    return responseFromPostgrestError(subsError);
  }

  // Get total users (profiles) count
  const { count: profilesCount, error: profilesError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (profilesError) {
    return responseFromPostgrestError(profilesError);
  }

  const subscribers = subscribersCount ?? 0;
  const totalUsers = profilesCount ?? 0;
  const rate = totalUsers > 0 ? (subscribers / totalUsers) * 100 : 0;

  return jsonOk({
    subscribers,
    totalUsers,
    subscriptionRate: parseFloat(rate.toFixed(1)),
  });
}
