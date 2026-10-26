import Link from "next/link";
import { cache, Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getLearnerUser, getUserRoles } from "@/lib/campus/learning";
import { CampusMobileNav } from "@/components/features/campus/CampusMobileNav";
import { CampusSidebar } from "@/components/features/campus/CampusSidebar";
import { CampusMain, HideInClassroom } from "@/components/features/campus/CampusChrome";
import { UserMenu } from "@/components/features/campus/UserMenu";
import { LanguageToggle } from "@/components/shared/language-toggle";
import {
  PreviewAutoEnter,
  RolePreviewSwitcher,
} from "@/components/features/campus/RolePreviewSwitcher";
import {
  isCampusPreviewEnabled,
  navLinksForRole,
  parsePreviewRole,
  primaryRoleFromSlugs,
  PREVIEW_COOKIE,
  type CampusNavLink,
  type PreviewRole,
} from "@/lib/dev/campus-preview";

/**
 * Campus is session-bound. Nested pages that still await the user at the
 * top of the segment are allowed to block until they are wrapped in Suspense.
 */
export const instant = false;

export default function CampusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[100dvh] flex bg-paper text-primary">
      <Suspense fallback={<AsideFallback />}>
        <CampusAside />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<HeaderFallback />}>
          <CampusHeaderBar />
        </Suspense>
        <Suspense fallback={<ContentFallback />}>
          <CampusMain>{children}</CampusMain>
        </Suspense>
      </div>
    </div>
  );
}

function AsideFallback() {
  return (
    <div className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 border-r border-primary/10 bg-paper xl:flex" />
  );
}

function HeaderFallback() {
  return <div className="h-16 border-b border-primary/10" />;
}

function ContentFallback() {
  return (
    <div className="flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
      <div className="h-32 animate-pulse rounded-2xl bg-primary/5" />
    </div>
  );
}

const getCampusSession = cache(async function getCampusSession() {
  const [{ user }, slugs] = await Promise.all([getLearnerUser(), getUserRoles()]);
  const preview = isCampusPreviewEnabled();

  if (!user) {
    if (preview) return { user: null, preview, navLinks: navLinksForRole("student"), role: "student" as PreviewRole };
    redirect("/auth/login?clear=1");
  }

  // Deactivated accounts (also via Google sign-in) are signed out on the login page.
  const { supabase } = await getLearnerUser();
  const { data: profile } = await supabase.from("profiles").select("is_active").eq("id", user.id).maybeSingle();
  if (profile && profile.is_active === false) redirect("/auth/login?clear=1&inactive=1");

  const cookieStore = await cookies();
  const cookieRole = parsePreviewRole(cookieStore.get(PREVIEW_COOKIE)?.value);
  const role: PreviewRole = preview
    ? cookieRole ?? primaryRoleFromSlugs(slugs)
    : primaryRoleFromSlugs(slugs);

  return { user, preview, navLinks: navLinksForRole(role), role };
});

async function CampusAside() {
  const session = await getCampusSession();
  if (!session.user) return null;
  return <CampusSidebar navLinks={session.navLinks} />;
}

async function CampusHeaderBar() {
  const session = await getCampusSession();
  if (!session.user) {
    return session.preview ? <PreviewAutoEnter /> : null;
  }
  return (
    <CampusHeader
      user={session.user}
      navLinks={session.navLinks}
      preview={session.preview}
      role={session.role}
    />
  );
}

function CampusHeader({
  user,
  navLinks,
  preview,
  role,
}: {
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
  navLinks: CampusNavLink[];
  preview: boolean;
  role: PreviewRole;
}) {
  return (
    <HideInClassroom>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-primary/10 bg-paper/85 px-4 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-1 xl:hidden">
          <CampusMobileNav navLinks={navLinks} />
          <Link href="/campus" aria-label="Hope Aviation campus">
            <img src="/logos/hope-logo.svg" alt="Hope Aviation" className="h-6 w-auto" />
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {preview ? <RolePreviewSwitcher currentRole={role} /> : null}
          <LanguageToggle />
          <UserMenu user={user as never} />
        </div>
      </header>
    </HideInClassroom>
  );
}
