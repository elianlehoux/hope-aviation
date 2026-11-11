"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";
import { safeNext } from "@/lib/auth/safe-next";
import { Button } from "@/components/ui/button";
import {
  AuthDivider,
  AuthField,
  AuthHeading,
  FormAlert,
  GoogleButton,
  PasswordField,
  SubmitButton,
  currentOrigin,
  looksLikeEmail,
} from "./auth-ui";

type FieldErrors = Partial<Record<"firstName" | "lastName" | "email" | "password", string>>;

const RESEND_COOLDOWN_S = 30;

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useTranslation();
  const es = lang === "es";
  const next = safeNext(searchParams.get("next"));

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const redirectTo = `${currentOrigin()}/api/auth/callback?next=${encodeURIComponent(next)}`;

  function validate(): FieldErrors {
    const out: FieldErrors = {};
    if (!firstName.trim()) out.firstName = es ? "Escribí tu nombre." : "Enter your first name.";
    if (!lastName.trim()) out.lastName = es ? "Escribí tu apellido." : "Enter your last name.";
    if (!email.trim()) out.email = es ? "Escribí tu mail." : "Enter your email.";
    else if (!looksLikeEmail(email)) out.email = es ? "Ese mail no parece válido." : "That email doesn't look right.";
    if (password.length < 8)
      out.password = es ? "La clave necesita al menos 8 caracteres." : "Your password needs at least 8 characters.";
    return out;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setLoading(false);
      if (error.code === "weak_password") {
        setErrors({ password: es ? "Esa clave es muy fácil. Probá con otra más larga." : "That password is too easy. Try a longer one." });
      } else if (error.code === "user_already_exists") {
        setFormError(es ? "Ya hay una cuenta con ese mail. Entrá o recuperá tu clave." : "There's already an account with that email. Sign in or reset your password.");
      } else if (error.status === 429) {
        setFormError(es ? "Hiciste varios intentos seguidos. Esperá un minuto y probá de nuevo." : "Too many attempts. Wait a minute and try again.");
      } else {
        setFormError(es ? "No pudimos crear la cuenta. Probá de nuevo en un momento." : "We couldn't create your account. Try again in a moment.");
      }
      return;
    }

    if (data.session) {
      // Email confirmation disabled: the user is already signed in.
      router.replace(next);
      router.refresh();
      return;
    }

    setSentTo(email.trim());
    setLoading(false);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, scopes: "email profile", queryParams: { access_type: "offline", prompt: "consent" } },
    });
    if (error) {
      setGoogleLoading(false);
      setFormError(es ? "No pudimos abrir Google. Probá de nuevo." : "We couldn't open Google. Try again.");
    }
  }

  if (sentTo) {
    return <CheckEmail email={sentTo} redirectTo={redirectTo} es={es} />;
  }

  const busy = loading || googleLoading;
  const clear = (key: keyof FieldErrors) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title={es ? "Creá tu cuenta" : "Create your account"}
        description={
          es
            ? "Es gratis. Vas a poder anotarte en los cursos y seguir tu avance."
            : "It's free. Enroll in courses and keep track of your progress."
        }
      />

      <GoogleButton
        onClick={handleGoogle}
        loading={googleLoading}
        disabled={busy}
        label={es ? "Continuar con Google" : "Continue with Google"}
      />

      <AuthDivider label={es ? "o con tu mail" : "or with email"} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="first_name"
            name="first_name"
            autoComplete="given-name"
            label={es ? "Nombre" : "First name"}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clear("firstName");
            }}
            error={errors.firstName}
            disabled={busy}
          />
          <AuthField
            id="last_name"
            name="last_name"
            autoComplete="family-name"
            label={es ? "Apellido" : "Last name"}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clear("lastName");
            }}
            error={errors.lastName}
            disabled={busy}
          />
        </div>

        <AuthField
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          label={es ? "Mail" : "Email"}
          placeholder={es ? "nombre@ejemplo.com" : "name@example.com"}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clear("email");
          }}
          error={errors.email}
          disabled={busy}
        />

        <PasswordField
          id="password"
          name="password"
          autoComplete="new-password"
          label={es ? "Clave" : "Password"}
          hint={es ? "Mínimo 8 caracteres." : "At least 8 characters."}
          showLabel={es ? "Mostrar clave" : "Show password"}
          hideLabel={es ? "Ocultar clave" : "Hide password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
          error={errors.password}
          disabled={busy}
        />

        {formError ? <FormAlert>{formError}</FormAlert> : null}

        <SubmitButton loading={loading} loadingLabel={es ? "Creando tu cuenta…" : "Creating your account…"} disabled={googleLoading} className="mt-1">
          {es ? "Crear cuenta" : "Create account"}
        </SubmitButton>
      </form>

      <p className="text-center text-[15px] text-muted-foreground">
        {es ? "¿Ya tenés cuenta? " : "Already have an account? "}
        <Link
          href={next === "/campus" ? "/auth/login" : `/auth/login?next=${encodeURIComponent(next)}`}
          className="rounded-sm font-semibold text-primary underline decoration-highlight decoration-2 underline-offset-4 hover:decoration-primary focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {es ? "Entrá" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}

/** "Check your email" state after sign-up, with a rate-limited resend. */
function CheckEmail({ email, redirectTo, es }: { email: string; redirectTo: string; es: boolean }) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<"sent" | "error" | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function resend() {
    setSending(true);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectTo } });
    setSending(false);
    setNotice(error ? "error" : "sent");
    setCooldown(RESEND_COOLDOWN_S);
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        icon={<MailCheck />}
        title={es ? "Revisá tu mail" : "Check your email"}
        description={
          <>
            {es ? "Te mandamos un link a " : "We sent a link to "}
            <span className="font-semibold text-primary break-all">{email}</span>
            {es ? " para confirmar tu cuenta. Abrilo y entrás directo al campus." : " to confirm your account. Open it and you'll go straight to the campus."}
          </>
        }
      />

      <div className="rounded-[20px] border border-primary/10 bg-white p-5 text-[15px] leading-relaxed text-muted-foreground">
        {es
          ? "¿No te llegó? Fijate en spam o promociones. Puede tardar un par de minutos."
          : "Didn't get it? Check spam or promotions. It can take a couple of minutes."}
      </div>

      {notice === "sent" ? (
        <FormAlert tone="success">{es ? "Listo, te lo reenviamos." : "Done, we sent it again."}</FormAlert>
      ) : null}
      {notice === "error" ? (
        <FormAlert>{es ? "No pudimos reenviarlo. Esperá un minuto y probá de nuevo." : "We couldn't resend it. Wait a minute and try again."}</FormAlert>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={resend}
          disabled={sending || cooldown > 0}
          className="h-12 w-full border-primary/20 text-base"
        >
          {sending
            ? es ? "Reenviando…" : "Sending…"
            : cooldown > 0
              ? es ? `Reenviar en ${cooldown} s` : `Resend in ${cooldown}s`
              : es ? "Reenviar el mail" : "Resend the email"}
        </Button>
        <Link
          href="/auth/login"
          className="rounded-full py-2 text-center text-[15px] font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {es ? "Volver a entrar" : "Back to sign in"}
        </Link>
      </div>
    </div>
  );
}
