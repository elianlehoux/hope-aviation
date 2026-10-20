import Link from "next/link";
import { cache, Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { CampusMobileNav } from "@/components/features/campus/CampusMobileNav";
import { CampusSidebar } from "@/components/features/campus/CampusSidebar";
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
        <main className="flex-1 p-6 md:p-8">
          <Suspense fallback={<ContentFallback />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

function AsideFallback() {
  return (
    <div className="sticky top-0 hidden h-[100dvh] w-64 border-r border-primary/10 bg-white xl:flex" />
  );
}

function HeaderFallback() {
  return <div className="h-16 border-b border-primary/10 bg-white/80" />;
}

function ContentFallback() {
  return <div className="h-32 animate-pulse rounded-2xl bg-primary/5" />;
}

const getCampusSession = cache(async function getCampusSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const preview = isCampusPreviewEnabled();

  if (!user) {
    if (preview) return { user: null, preview, navLinks: navLinksForRole("student"), role: "student" as PreviewRole };
    redirect("/auth/login?clear=1");
  }

  const { data: roleRows } = await supabase
    .from("roles_users")
    .select("roles(slug)")
    .eq("user_id", user.id);

  const slugs = (roleRows || [])
    .map((row: { roles?: { slug?: string } | { slug?: string }[] | null }) => {
      const rel = row.roles;
      if (Array.isArray(rel)) return rel[0]?.slug;
      return rel?.slug;
    })
    .filter((slug): slug is string => Boolean(slug));

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
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-primary/10 bg-white/80 px-4 backdrop-blur-xl md:px-6">
      <div className="xl:hidden">
        <CampusMobileNav navLinks={navLinks} />
      </div>
      <Link
        href="/"
        className="hidden text-xs font-medium text-primary/50 transition-colors hover:text-primary sm:block xl:hidden"
      >
        Hope Aviation
      </Link>
      <div className="ml-auto flex items-center gap-3">
        {preview ? <RolePreviewSwitcher currentRole={role} /> : null}
        <LanguageToggle />
        <UserMenu user={user as never} />
      </div>
    </header>
  );
}
