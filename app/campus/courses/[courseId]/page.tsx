import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/api/auth";
import { notFound } from "next/navigation";
import { CourseCurriculum } from "@/components/features/campus/CourseCurriculum";
import { EnrollmentAction } from "@/components/features/campus/EnrollmentAction";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, GraduationCap, ShieldCheck, ChevronLeft, Calendar } from "lucide-react";
import { parseUuidParam } from "@/lib/api/params";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { T } from "@/lib/i18n/context";
import { getServerLang } from "@/lib/i18n/server";

/**
 * Detailed course landing page for students to explore curriculum 
 * and enroll in professional aviation courses.
 */
export default async function CourseDetailPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const { courseId: rawId } = await params;
  const courseId = parseUuidParam(rawId);
  if (!courseId) return notFound();

  const supabase = await createClient();
  const session = await requireSession(supabase);
  if (!session.ok) return session.response;

  // 1. Fetch Course with Ordered Subjects and Classes
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      subjects (
        *,
        classes (*)
      )
    `)
    .eq("id", courseId)
    .order("order_index", { foreignTable: "subjects" })
    .order("order_index", { foreignTable: "subjects.classes" })
    .maybeSingle();

  if (error || !course) return notFound();

  // 2. Check Enrollment Status
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("status")
    .eq("user_id", session.user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  const isEnrolled = !!enrollment;
  const lang = await getServerLang();
  const title = typeof course.title === "string" ? course.title : (course.title?.[lang] || "Untitled Course");
  const description = typeof course.description === "string" ? course.description : (course.description?.[lang] || "");
  
  const totalClasses = course.subjects?.reduce((acc: number, s: any) => acc + (s.classes?.length || 0), 0) || 0;
  const totalDuration = course.subjects?.reduce((acc: number, s: any) => 
    acc + (s.classes?.reduce((sum: number, c: any) => sum + (c.duration_minutes || 0), 0) || 0), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-12">
      {/* Navigation & Breadcrumbs */}
      <div className="flex items-center pt-2">
        <Link 
          href="/campus/courses" 
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary">
            <ChevronLeft className="size-4" />
          </div>
          <T k="courseDetail.backToCatalog" />
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-primary/5">
        <div className="flex flex-col lg:flex-row h-full min-h-[500px]">
          {/* Content Column */}
          <div className="flex-1 p-8 md:p-12 lg:p-16 space-y-8 z-10 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {isEnrolled && (
                  <Badge className="px-4 py-1 text-xs uppercase tracking-widest font-bold bg-emerald-500 text-white border-none">
                    <T k="courseDetail.currentlyEnrolled" />
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary leading-[1.1]">
                {title}
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                {description}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-4">
              <StatItem icon={<BookOpen className="size-5" />} label={<T k="courseDetail.modules" />} value={course.subjects?.length || 0} />
              <StatItem icon={<Video className="size-5 text-brand-orange" />} label={<T k="courseDetail.lessons" />} value={totalClasses} />
              <StatItem 
                icon={<Clock className="size-5" />} 
                label={<T k="courseDetail.duration" />} 
                value={totalDuration >= 60 
                  ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m` 
                  : `${totalDuration}m`
                } 
              />
            </div>

            {/* Main Action */}
            <div className="pt-4">
              <EnrollmentAction courseId={course.id} isEnrolled={isEnrolled} />
            </div>
          </div>

          {/* Media Column / Thumbnail */}
          <div className="lg:w-2/5 relative h-[300px] lg:h-auto overflow-hidden order-first lg:order-last">
            <img 
              src={course.thumbnail_url || "/images/placeholder-course.jpg"} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-white via-white/20 to-transparent lg:block hidden" />
            <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent lg:hidden block" />
          </div>
        </div>
      </section>

      {/* Course Content & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Curriculum */}
          <CourseCurriculum subjects={course.subjects} />
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-8">
           <div className="sticky top-28 p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-primary/5 space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                 <StatItem 
                    icon={<ShieldCheck className="size-5 text-emerald-500" />} 
                    label={<T k="courseDetail.certificate" />} 
                    value={<T k="courseDetail.included" />} 
                 />
                 <StatItem 
                    icon={<Calendar className="size-5 text-brand-orange" />} 
                    label={<T k="courseDetail.access" />} 
                    value={<T k="courseDetail.lifetime" />} 
                 />
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: React.ReactNode, value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-lg font-bold text-primary tracking-tight">{value}</div>
    </div>
  );
}



function Video(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" />
      <rect x="2" y="6" width="14" height="12" rx="3" />
    </svg>
  );
}
