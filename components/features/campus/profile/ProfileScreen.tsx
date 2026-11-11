"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { AccountSection } from "./AccountSection";
import { patchProfile, ProfileDetails, type ProfileData } from "./ProfileDetails";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <CampusSurface className="p-5 sm:p-7">
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold text-primary">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-primary/65">{description}</p>
      </div>
      {children}
    </CampusSurface>
  );
}

/** Language (mirrors LanguageToggle) and the newsletter switch, saved immediately. */
function Preferences({ newsletter }: { newsletter: boolean }) {
  const { lang, setLang } = useTranslation();
  const es = lang === "es";
  const [optIn, setOptIn] = React.useState(newsletter);
  const [saving, setSaving] = React.useState(false);

  const onNewsletter = async (value: boolean) => {
    setOptIn(value);
    setSaving(true);
    const ok = await patchProfile({ newsletter_opt_in: value }, es);
    setSaving(false);
    if (!ok) setOptIn(!value);
    else
      toast.success(
        value
          ? es
            ? "Te vamos a escribir con novedades."
            : "We'll write to you with news."
          : es
            ? "Listo, no te mandamos más novedades."
            : "Done, no more news emails.",
      );
  };

  const languages = [
    { value: "es" as const, label: "Español" },
    { value: "en" as const, label: "English" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary" id="pref-language">
            {es ? "Idioma" : "Language"}
          </p>
          <p className="text-xs text-primary/65">{es ? "Para todo el campus y la web." : "For the whole campus and site."}</p>
        </div>
        <div role="radiogroup" aria-labelledby="pref-language" className="inline-flex rounded-full bg-paper p-1 ring-1 ring-primary/10">
          {languages.map((l) => (
            <button
              key={l.value}
              type="button"
              role="radio"
              aria-checked={lang === l.value}
              onClick={() => setLang(l.value)}
              className={cn(
                "min-h-9 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/30",
                lang === l.value ? "bg-white text-primary shadow-sm" : "text-primary/65 hover:text-primary",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-primary/10 pt-6">
        <label htmlFor="pref-newsletter" className="min-w-0">
          <span className="block text-sm font-semibold text-primary">Newsletter</span>
          <span className="block text-xs text-primary/65">
            {es ? "Novedades de Hope Aviation, cada tanto." : "Hope Aviation news, now and then."}
          </span>
        </label>
        <Switch
          id="pref-newsletter"
          checked={optIn}
          disabled={saving}
          onCheckedChange={(v) => void onNewsletter(v)}
        />
      </div>
    </div>
  );
}

/** Campus profile: details, preferences and account, each in its own surface. */
export function ProfileScreen({
  profile,
  email,
  usesGoogle,
}: {
  profile: ProfileData;
  email: string;
  usesGoogle: boolean;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CampusPageHeader
        title={es ? "Tu perfil" : "Your profile"}
        description={es ? "Tus datos, cómo usás el campus y tu cuenta." : "Your details, how you use the campus and your account."}
      />
      <Section
        title={es ? "Tus datos" : "Your details"}
        description={es ? "Los usamos para tus certificados y para contactarte." : "We use them for your certificates and to reach you."}
      >
        <ProfileDetails profile={profile} />
      </Section>
      <Section title={es ? "Preferencias" : "Preferences"} description={es ? "Se guardan al instante." : "Saved instantly."}>
        <Preferences newsletter={profile.newsletter_opt_in} />
      </Section>
      <Section title={es ? "Cuenta" : "Account"} description={es ? "Cómo entrás al campus." : "How you sign in to the campus."}>
        <AccountSection email={email} usesGoogle={usesGoogle} />
      </Section>
    </div>
  );
}
