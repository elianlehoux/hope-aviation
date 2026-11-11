import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getRoleSlugs } from "@/lib/api/auth";

/**
 * Current campus user and role slugs, memoized per request so the layout,
 * navigation and route guards share a single lookup.
 */
export const getCampusSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, roles: new Set<string>() };
  }

  const roles = await getRoleSlugs(supabase, user.id);
  return { user, roles };
});

export type CampusNavLink = {
  href: string;
  labelKey: string;
  /** Roles allowed to see the link. Omit to show it to every signed-in user. */
  roles?: string[];
};

export function filterNavLinks(links: CampusNavLink[], roles: Set<string>) {
  return links
    .filter((link) => !link.roles || link.roles.some((r) => roles.has(r)))
    .map(({ href, labelKey }) => ({ href, labelKey }));
}
