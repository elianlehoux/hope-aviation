import CourseDetailPanel from "@/components/features/admin/CourseDetailPanel";

type Props = { params: Promise<{ courseId: string }> };

export async function generateMetadata({ params }: Props) {
  return {
    title: "Detalle del Curso — Hope Aviation Admin",
  };
}

/**
 * Admin course detail — structure and metadata.
 */
export default async function AdminCourseDetailPage({ params }: Props) {
  const { courseId } = await params;

  return <CourseDetailPanel courseId={courseId} />;
}
