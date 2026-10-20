"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PREVIEW_ROLES, type PreviewRole } from "@/lib/dev/campus-preview";
import { useTranslation } from "@/lib/i18n/context";

export function RolePreviewSwitcher({ currentRole }: { currentRole: PreviewRole }) {
  const router = useRouter();
  const { lang } = useTranslation();
  const [pending, setPending] = React.useState<PreviewRole | null>(null);

  const current = PREVIEW_ROLES.find((r) => r.value === currentRole) ?? PREVIEW_ROLES[0];

  async function switchRole(role: PreviewRole) {
    if (role === currentRole || pending) return;
    setPending(role);
    try {
      const res = await fetch("/api/preview/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        throw new Error("Could not switch preview role");
      }
      router.push("/campus");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-primary/15 bg-white px-3 text-xs font-semibold text-primary shadow-sm transition-colors hover:border-brand-orange/40 hover:bg-paper"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin text-brand-orange" />
          ) : (
            <span className="size-1.5 rounded-full bg-brand-orange" />
          )}
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.14em] text-primary/50">
            Vista
          </span>
          <span>{lang === "es" ? current.labelEs : current.labelEn}</span>
          <ChevronDown className="size-3.5 text-primary/40" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {PREVIEW_ROLES.map((role) => (
          <DropdownMenuItem
            key={role.value}
            onSelect={() => switchRole(role.value)}
            className={role.value === currentRole ? "bg-brand-orange/10 font-semibold" : ""}
          >
            {lang === "es" ? role.labelEs : role.labelEn}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PreviewAutoEnter() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/preview/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "student" }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error?.message || "Preview sign-in failed");
        }
        if (!cancelled) router.refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Preview sign-in failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center bg-paper text-primary">
      <Loader2 className="size-6 animate-spin text-brand-orange" />
      <p className="mt-4 text-sm font-medium">
        {error ? error : "Entrando al campus…"}
      </p>
    </div>
  );
}
