/**
 * Temporary campus preview: skip the login wall and switch Alumno / Teacher / Admin.
 * Enabled only when CAMPUS_PREVIEW_AUTH=1 and we are not in production.
 */

export type PreviewRole = "student" | "instructor" | "admin";

export const PREVIEW_COOKIE = "ha_preview_role";

export const PREVIEW_ROLES: { value: PreviewRole; labelEs: string; labelEn: string }[] = [
  { value: "student", labelEs: "Alumno", labelEn: "Student" },
  { value: "instructor", labelEs: "Teacher", labelEn: "Teacher" },
  { value: "admin", labelEs: "Administrador", labelEn: "Administrator" },
];

export type CampusNavLink = { href: string; labelKey: string };

export function isCampusPreviewEnabled(): boolean {
  return (
    process.env.CAMPUS_PREVIEW_AUTH === "1" &&
    process.env.NODE_ENV !== "production" &&
    process.env.VERCEL_ENV !== "production"
  );
}

export function parsePreviewRole(value: string | null | undefined): PreviewRole | null {
  if (value === "student" || value === "instructor" || value === "admin") {
    return value;
  }
  return null;
}

export function previewCredentials(role: PreviewRole): { email: string; password: string } {
  const emails: Record<PreviewRole, string | undefined> = {
    student: process.env.PREVIEW_STUDENT_EMAIL,
    instructor: process.env.PREVIEW_INSTRUCTOR_EMAIL,
    admin: process.env.PREVIEW_ADMIN_EMAIL,
  };
  const email = emails[role];
  const password = process.env.PREVIEW_PASSWORD;
  if (!email || !password) {
    throw new Error(`Missing preview credentials for role "${role}".`);
  }
  return { email, password };
}

export function navLinksForRole(role: PreviewRole | string | null): CampusNavLink[] {
  const student: CampusNavLink[] = [
    { href: "/campus", labelKey: "campus.home" },
    { href: "/campus/courses", labelKey: "campus.courses" },
    { href: "/campus/certificates", labelKey: "campus.myCertificates" },
    { href: "/campus/profile", labelKey: "campus.profile" },
  ];

  const instructor: CampusNavLink[] = [
    ...student,
    { href: "/campus/admin/courses", labelKey: "campus.manageCourses" },
    { href: "/campus/admin/exams", labelKey: "campus.exams" },
  ];

  const admin: CampusNavLink[] = [
    ...instructor,
    { href: "/campus/admin/user-management", labelKey: "campus.userManagement" },
    { href: "/campus/admin/users", labelKey: "campus.users" },
    { href: "/campus/admin/roles", labelKey: "campus.roles" },
    { href: "/campus/admin/newsletter", labelKey: "campus.newsletter" },
  ];

  if (role === "admin") return admin;
  if (role === "instructor") return instructor;
  return student;
}

export function primaryRoleFromSlugs(slugs: string[]): PreviewRole {
  if (slugs.includes("admin")) return "admin";
  if (slugs.includes("instructor")) return "instructor";
  return "student";
}
