import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLearnerUser } from "@/lib/campus/learning";
import { ProfileScreen } from "@/components/features/campus/profile/ProfileScreen";

export const metadata: Metadata = { title: "Perfil" };

/** Profile: server-loads the caller's row, then client sections save via PATCH /api/me/profile. */
export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileLoader />
    </Suspense>
  );
}

async function ProfileLoader() {
  const { supabase, user } = await getLearnerUser();
  if (!user) redirect("/auth/login?next=/campus/profile");

  const [{ data: profile }, { data: claimsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, email, phone, country_code, birth_date, newsletter_opt_in")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.auth.getClaims(),
  ]);

  const appMeta = (claimsData?.claims?.app_metadata ?? {}) as { provider?: string; providers?: string[] };
  const usesGoogle = appMeta.provider === "google" || Boolean(appMeta.providers?.includes("google"));

  return (
    <ProfileScreen
      profile={{
        first_name: profile?.first_name ?? "",
        last_name: profile?.last_name ?? "",
        phone: profile?.phone ?? null,
        country_code: profile?.country_code ?? null,
        birth_date: profile?.birth_date ?? null,
        newsletter_opt_in: Boolean(profile?.newsletter_opt_in),
      }}
      email={profile?.email ?? user.email ?? ""}
      usesGoogle={usesGoogle}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-hidden>
      <div className="h-9 w-48 animate-pulse rounded-lg bg-primary/10" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-56 animate-pulse rounded-2xl border border-primary/10 bg-white" />
      ))}
    </div>
  );
}
