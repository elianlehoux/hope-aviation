import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ProfileCompletionBanner } from "@/components/features/campus/ProfileCompletionBanner";

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

  const areas = [
    {
      title: "Students",
      description:
        "Enrollments, courses, subjects, classes, exams, and personal progress (profiles, enrollments, lesson_progress, exam_attempts).",
      href: "/campus/students",
    },
    {
      title: "Professors",
      description:
        "Teaching workspace for course content, classes, exams, and rosters (courses, subjects, classes, exams, enrollments).",
      href: "/campus/professors",
    },
    {
      title: "Admin",
      description:
        "Platform management: users, roles, catalog, and assessments (profiles, roles, roles_users, courses, exams).",
      href: "/campus/admin",
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {showBanner && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
          <ProfileCompletionBanner />
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Campus</h1>
        <p className="text-xl text-slate-500 font-medium">
          Choose an area to manage your aviation journey.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-xs transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
          >
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
            
            <h2 className="text-2xl font-bold tracking-tight text-primary group-hover:text-accent transition-colors">
              {item.title}
            </h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed font-medium">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
