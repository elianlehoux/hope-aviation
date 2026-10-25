"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

/** "Cuenta": read-only email, change (or create) password, sign out. */
export function AccountSection({ email, usesGoogle }: { email: string; usesGoogle: boolean }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [errors, setErrors] = React.useState<{ password?: string; confirm?: string }>({});
  const [saving, setSaving] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (password.length < 8) next.password = es ? "Usá al menos 8 caracteres." : "Use at least 8 characters.";
    if (confirm !== password) next.confirm = es ? "Las claves no coinciden." : "The passwords don't match.";
    setErrors(next);
    if (next.password || next.confirm) return;

    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (error) {
      const weak = /weak|short|least/i.test(error.message);
      const same = /different|same/i.test(error.message);
      setErrors({
        password: same
          ? es
            ? "Elegí una clave distinta de la actual."
            : "Choose a password different from the current one."
          : weak
            ? es
              ? "Esa clave es muy débil. Probá con una más larga."
              : "That password is too weak. Try a longer one."
            : undefined,
      });
      if (!same && !weak) toast.error(es ? "No pudimos cambiar la clave." : "We couldn't change the password.");
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success(es ? "Listo, cambiamos tu clave." : "Done, your password was changed.");
  };

  const onSignOut = async () => {
    setLeaving(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <Field
        label="Email"
        htmlFor="account-email"
        hint={
          usesGoogle
            ? es
              ? "Entrás con tu cuenta de Google."
              : "You sign in with your Google account."
            : es
              ? "Es tu usuario para entrar. No se puede cambiar desde acá."
              : "It's your sign-in. It can't be changed here."
        }
      >
        <input id="account-email" className={fieldControl} value={email} readOnly disabled />
      </Field>

      <form onSubmit={onChangePassword} noValidate className="space-y-4 border-t border-primary/10 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-primary">
            {usesGoogle ? (es ? "Crear una clave" : "Create a password") : es ? "Cambiar la clave" : "Change password"}
          </h3>
          {usesGoogle ? (
            <p className="mt-1 text-xs text-primary/55">
              {es
                ? "Opcional: te permite entrar también con email y clave."
                : "Optional: lets you also sign in with email and password."}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={es ? "Nueva clave" : "New password"} htmlFor="account-password" error={errors.password}>
            <input
              id="account-password"
              type="password"
              autoComplete="new-password"
              className={fieldControl}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? "account-password-error" : undefined}
            />
          </Field>
          <Field label={es ? "Repetila" : "Repeat it"} htmlFor="account-confirm" error={errors.confirm}>
            <input
              id="account-confirm"
              type="password"
              autoComplete="new-password"
              className={fieldControl}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setErrors((p) => ({ ...p, confirm: undefined }));
              }}
              aria-invalid={errors.confirm ? true : undefined}
              aria-describedby={errors.confirm ? "account-confirm-error" : undefined}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={saving || !password} className="w-full sm:w-auto">
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {es ? "Guardar clave" : "Save password"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3 border-t border-primary/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-primary/65">
          {es ? "¿Usás una compu compartida? Cerrá la sesión al terminar." : "On a shared computer? Sign out when you're done."}
        </p>
        <Button variant="outline" onClick={() => void onSignOut()} disabled={leaving} className="w-full sm:w-auto">
          {leaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LogOut className="size-4" aria-hidden />}
          {es ? "Cerrar sesión" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
