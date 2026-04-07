import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Title } from "@/components/ui/title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentCourseCard } from "@/components/features/campus/StudentCourseCard";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";

export default async function StudentCoursesPage() {
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

  // 1. Fetch Active & Completed Enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses (*, subjects(count))")
    .eq("user_id", user?.id)
    .order("enrolled_at", { ascending: false });

  const activeEnrollments = enrollments?.filter(e => e.status === "active") || [];
  const completedEnrollments = enrollments?.filter(e => e.status === "completed") || [];
  
  // 2. Fetch Catalog (Published)
  const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];
  
  const { data: catalogCourses } = await supabase
    .from("courses")
    .select("*, subjects(count)")
    .eq("status", "published")
    .not("id", "in", `(${enrolledCourseIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-brand-orange">
          <Sparkles className="size-6 animate-pulse" />
          <h4 className="text-sm font-bold uppercase tracking-widest opacity-70">Learning Dashboard</h4>
        </div>
        <Title level="h1" className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          My Academy
        </Title>
        <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
          Manage your enrollments, explore new aviation horizons, and track your professional progress.
        </p>
      </div>

      {/* Active Courses Section */}
      {activeEnrollments.length > 0 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 pl-1">
            <BookOpen className="size-6 text-brand-orange" />
            <h2 className="text-2xl font-bold tracking-tight text-primary">Continue Learning</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeEnrollments.map((e) => (
              <StudentCourseCard 
                key={e.id} 
                course={e.courses} 
                enrollment={e} 
                variant="active" 
              />
            ))}
          </div>
        </section>
      )}

      {/* Catalog Section */}
      <section className="space-y-10 py-10 border-y border-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Explore Catalog</h2>
            <p className="text-sm text-slate-500 font-medium">New courses available for your career specialisation.</p>
          </div>
          
          <Tabs defaultValue="all" className="w-full md:w-auto">
            <TabsList className="bg-slate-50 border border-slate-100 p-1 h-11 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">All Levels</TabsTrigger>
              <TabsTrigger value="new" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">New Releases</TabsTrigger>
              <TabsTrigger value="popular" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Popular</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {catalogCourses && catalogCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 group/catalog">
            {catalogCourses.slice(0, 6).map((course) => (
              <StudentCourseCard key={course.id} course={course} variant="available" />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
            <p className="text-slate-400 font-medium">You've reached civilian limit! More courses coming soon.</p>
          </div>
        )}

        {catalogCourses && catalogCourses.length > 6 && (
          <div className="flex justify-center pt-6">
            <button className="px-8 py-3 rounded-2xl bg-white border border-slate-200 text-primary font-bold shadow-xs hover:border-primary hover:text-primary transition-all active:scale-95">
              Load More Courses
            </button>
          </div>
        )}
      </section>

      {/* Completed Section */}
      {completedEnrollments.length > 0 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center gap-3 px-1">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <GraduationCap className="size-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-primary">Certifications & Achievements</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity">
            {completedEnrollments.map((e) => (
              <StudentCourseCard 
                key={e.id} 
                course={e.courses} 
                enrollment={e} 
                variant="completed" 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
