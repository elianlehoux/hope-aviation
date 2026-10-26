"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { Field, fieldControl } from "@/components/features/campus/ui/field";

/**
 * Asked inline before showing a certificate whose learner has no first or last name.
 * Saves through PATCH /api/me/profile, then refreshes so the sheet renders with the name.
 */
export function NameGate({
  firstName,
  lastName,
}: {
  firstName: string | null;
  lastName: string | null;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [first, setFirst] = useState(firstName ?? "");
  const [last, setLast] = useState(lastName ?? "");
  const [errors, setErrors] = useState<{ first?: string; last?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const f = first.replace(/\s+/g, " ").trim();
    const l = last.replace(/\s+/g, " ").trim();
    const next: typeof errors = {};
    if (!f) next.first = es ? "Escribí tu nombre." : "Enter your first name.";
    if (!l) next.last = es ? "Escribí tu apellido." : "Enter your last name.";
    setErrors(next);
    if (next.first || next.last) return;

    setSaving(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ first_name: f, last_name: l }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast.success(es ? "¡Listo! Ya está tu certificado." : "Done! Your certificate is ready.");
      router.refresh();
    } catch {
      setErrors({ form: es ? "No pudimos guardar tu nombre. Probá de nuevo." : "We couldn't save your name. Try again." });
      setSaving(false);
    }
  }

  return (
    <CampusSurface className="mx-auto max-w-xl p-6 sm:p-8">
      <span className="grid size-12 place-items-center rounded-2xl bg-highlight/15 text-primary">
        <Award className="size-6" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-primary">
        {es ? "¿Cómo querés que figure tu nombre?" : "How should your name appear?"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-primary/60">
        {es
          ? "Tu certificado lleva tu nombre y apellido completos. Escribilos tal como querés que se lean."
          : "Your certificate shows your full first and last name. Write them exactly as you want them to read."}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={es ? "Nombre" : "First name"} htmlFor="cert-first-name" error={errors.first}>
            <input
              id="cert-first-name"
              className={`${fieldControl} text-base sm:text-sm`}
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              autoComplete="given-name"
              maxLength={200}
              aria-invalid={Boolean(errors.first)}
              aria-describedby={errors.first ? "cert-first-name-error" : undefined}
              autoFocus
            />
          </Field>
          <Field label={es ? "Apellido" : "Last name"} htmlFor="cert-last-name" error={errors.last}>
            <input
              id="cert-last-name"
              className={`${fieldControl} text-base sm:text-sm`}
              value={last}
              onChange={(e) => setLast(e.target.value)}
              autoComplete="family-name"
              maxLength={200}
              aria-invalid={Boolean(errors.last)}
              aria-describedby={errors.last ? "cert-last-name-error" : undefined}
            />
          </Field>
        </div>
        {errors.form ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errors.form}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {es ? "Guardar y ver mi certificado" : "Save and see my certificate"}
        </Button>
      </form>
    </CampusSurface>
  );
}

/** Certificate page state when the name is missing: the gate for the learner, a note for staff. */
export function CertificateNameStep({
  isOwner,
  firstName,
  lastName,
}: {
  isOwner: boolean;
  firstName: string | null;
  lastName: string | null;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <Link
        href="/campus/certificates"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/55 hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {es ? "Mis certificados" : "My certificates"}
      </Link>
      {isOwner ? (
        <NameGate firstName={firstName} lastName={lastName} />
      ) : (
        <CampusSurface className="mx-auto max-w-xl p-6 text-sm leading-relaxed text-primary/70">
          {es
            ? "Este certificado todavía no tiene nombre: la persona tiene que completar su nombre y apellido."
            : "This certificate has no name yet: the learner needs to add their first and last name."}
        </CampusSurface>
      )}
    </div>
  );
}
