import { cache } from "react";
import { headers } from "next/headers";
import { getLearnerUser, getUserRoles } from "@/lib/campus/learning";
import { joinFullName } from "@/components/features/campus/certificate/format";
import type { TranslatedText } from "@/types/database";

/**
 * Certificates are completed enrollments: `enrollments.completed_at` and
 * `enrollments.certificate_code` are issued by the database when the course is completed.
 * Reads go through the user's session, so RLS decides which rows come back.
 */

export type CertificateSummary = {
  enrollmentId: string;
  courseId: string;
  courseTitle: TranslatedText;
  completedAt: string;
  code: string;
};

export type CertificateDetail = CertificateSummary & {
  /** "First Last", or null when either part is missing on the profile. */
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  /** True when the signed-in user is the learner (only they can fix a missing name). */
  isOwner: boolean;
};

type CourseRel = { title: TranslatedText } | { title: TranslatedText }[] | null;
type ProfileRel =
  | { first_name: string | null; last_name: string | null }
  | { first_name: string | null; last_name: string | null }[]
  | null;

const one = <T,>(rel: T | T[] | null | undefined): T | null => (Array.isArray(rel) ? (rel[0] ?? null) : (rel ?? null));

export const getMyCertificates = cache(async (): Promise<CertificateSummary[]> => {
  const { supabase, user } = await getLearnerUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select("id, course_id, completed_at, certificate_code, courses ( title )")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .not("certificate_code", "is", null)
    .order("completed_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("getMyCertificates", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    enrollmentId: row.id as string,
    courseId: row.course_id as string,
    courseTitle: one(row.courses as CourseRel)?.title ?? {},
    completedAt: (row.completed_at as string | null) ?? "",
    code: row.certificate_code as string,
  }));
});

/**
 * One certificate by enrollment id. Returns null unless the enrollment is completed and the
 * viewer is its learner or staff (admin / instructor).
 */
export const getCertificate = cache(async (enrollmentId: string): Promise<CertificateDetail | null> => {
  const { supabase, user } = await getLearnerUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "id, user_id, course_id, status, completed_at, certificate_code, courses ( title ), profiles ( first_name, last_name )",
    )
    .eq("id", enrollmentId)
    .maybeSingle();

  if (error) {
    console.error("getCertificate", error.message);
    return null;
  }
  if (!data || data.status !== "completed" || !data.certificate_code) return null;

  const isOwner = data.user_id === user.id;
  if (!isOwner) {
    const roles = await getUserRoles();
    if (!roles.includes("admin") && !roles.includes("instructor")) return null;
  }

  const profile = one(data.profiles as ProfileRel);
  const firstName = profile?.first_name?.trim() || null;
  const lastName = profile?.last_name?.trim() || null;

  return {
    enrollmentId: data.id as string,
    courseId: data.course_id as string,
    courseTitle: one(data.courses as CourseRel)?.title ?? {},
    completedAt: (data.completed_at as string | null) ?? "",
    code: data.certificate_code as string,
    fullName: joinFullName(firstName, lastName),
    firstName,
    lastName,
    isOwner,
  };
});

/** Public base URL for verification links: NEXT_PUBLIC_SITE_URL, else the request origin. */
export async function getCertificateSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** True when the signed-in user's profile has both a first and a last name. */
export const getMyNameReady = cache(async (): Promise<boolean> => {
  const { supabase, user } = await getLearnerUser();
  if (!user) return false;
  const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle();
  return Boolean(joinFullName(data?.first_name as string | null, data?.last_name as string | null));
});
