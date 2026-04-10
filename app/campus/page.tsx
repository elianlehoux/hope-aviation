import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { CampusDashboardContent } from "@/components/features/campus/CampusDashboardContent";

/**
 * Campus hub — links into role-oriented areas (students, professors, admin).
 */
export default async function CampusDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  let showBanner = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, birth_date, country_code")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      // Logic for completion: nombre (first), apellido (last), fecha nac (birth), pais (country)
      // Note: first_name and last_name are NOT NULL but could be email splits or empty strings.
      // We'll trust the user's explicit rule: they must have a last_name, birth_date, and country_code.
      const isComplete = 
        profile.first_name && 
        profile.last_name && 
        profile.birth_date && 
        profile.country_code;

      showBanner = !isComplete;
    }
  }

  return <CampusDashboardContent showBanner={showBanner} />;
}
