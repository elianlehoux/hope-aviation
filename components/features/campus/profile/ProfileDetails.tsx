"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import { countries } from "@/lib/utils/countries";

export type ProfileData = {
  first_name: string;
  last_name: string;
  phone: string | null;
  country_code: string | null;
  birth_date: string | null;
  newsletter_opt_in: boolean;
};

type Errors = Partial<Record<"first_name" | "last_name" | "phone" | "birth_date", string>>;

const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

/** PATCH /api/me/profile; returns false (and toasts) on failure. */
export async function patchProfile(body: Partial<ProfileData>, es: boolean): Promise<boolean> {
  try {
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return true;
  } catch {
    // fall through to the toast
  }
  toast.error(es ? "No pudimos guardar los cambios. Probá de nuevo." : "We couldn't save your changes. Please try again.");
  return false;
}

/** "Tus datos": name (used on certificates), birth date, country and phone. */
export function ProfileDetails({ profile }: { profile: ProfileData }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [values, setValues] = React.useState({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    phone: profile.phone ?? "",
    country_code: profile.country_code ?? "",
    birth_date: profile.birth_date ? profile.birth_date.slice(0, 10) : "",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [saving, setSaving] = React.useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    const required = es ? "Completá este campo." : "Fill in this field.";
    if (!values.first_name.trim()) next.first_name = required;
    else if (values.first_name.trim().length > 200) next.first_name = es ? "Es demasiado largo." : "It's too long.";
    if (!values.last_name.trim()) next.last_name = required;
    else if (values.last_name.trim().length > 200) next.last_name = es ? "Es demasiado largo." : "It's too long.";
    if (values.phone.trim().length > 50) next.phone = es ? "Es demasiado largo." : "It's too long.";
    if (values.phone.trim() && !/^[+()\d\s.-]{6,}$/.test(values.phone.trim()))
      next.phone = es ? "Usá solo números, espacios y +." : "Use only digits, spaces and +.";
    if (values.birth_date && values.birth_date > new Date().toISOString().slice(0, 10))
      next.birth_date = es ? "La fecha no puede ser futura." : "The date can't be in the future.";
    return next;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`profile-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setSaving(true);
    const ok = await patchProfile(
      {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone.trim() || null,
        country_code: values.country_code || null,
        birth_date: values.birth_date || null,
      },
      es,
    );
    setSaving(false);
    if (ok) {
      toast.success(es ? "Guardamos tus datos." : "Your details were saved.");
      router.refresh();
    }
  };

  const input = (key: keyof Errors | "country_code") => ({
    id: `profile-${key}`,
    "aria-invalid": key !== "country_code" && errors[key] ? true : undefined,
    "aria-describedby": key !== "country_code" && errors[key] ? `profile-${key}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field label={es ? "Nombre" : "First name"} htmlFor="profile-first_name" error={errors.first_name}>
        <input
          {...input("first_name")}
          className={fieldControl}
          value={values.first_name}
          onChange={set("first_name")}
          autoComplete="given-name"
        />
      </Field>
      <Field label={es ? "Apellido" : "Last name"} htmlFor="profile-last_name" error={errors.last_name}>
        <input
          {...input("last_name")}
          className={fieldControl}
          value={values.last_name}
          onChange={set("last_name")}
          autoComplete="family-name"
        />
      </Field>
      <p className="-mt-2 text-xs text-primary/50 sm:col-span-2">
        {es ? "Así va a figurar tu nombre en los certificados." : "This is how your name appears on certificates."}
      </p>
      <Field label={es ? "Fecha de nacimiento" : "Birth date"} htmlFor="profile-birth_date" error={errors.birth_date}>
        <input
          {...input("birth_date")}
          type="date"
          className={fieldControl}
          value={values.birth_date}
          onChange={set("birth_date")}
          max={new Date().toISOString().slice(0, 10)}
          autoComplete="bday"
        />
      </Field>
      <Field label={es ? "País" : "Country"} htmlFor="profile-country_code">
        <select {...input("country_code")} className={fieldControl} value={values.country_code} onChange={set("country_code")}>
          <option value="">{es ? "Elegí tu país" : "Choose your country"}</option>
          {sortedCountries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label={es ? "Teléfono" : "Phone"}
        htmlFor="profile-phone"
        hint={es ? "Opcional. Con código de país, por ejemplo +54." : "Optional. Include the country code, e.g. +54."}
        error={errors.phone}
        className="sm:col-span-2"
      >
        <input
          {...input("phone")}
          type="tel"
          inputMode="tel"
          className={fieldControl}
          value={values.phone}
          onChange={set("phone")}
          autoComplete="tel"
        />
      </Field>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {es ? "Guardar cambios" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
